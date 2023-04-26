import 'dotenv/config'
import {createClient} from 'contentful'
import type {EntryCollection} from 'contentful'
import getEBEntry from './getEBEntry'
import {writeFile} from 'fs/promises'

export default async function fetchEvictorData() {
  const client = createClient({
    space: process.env.SPACE_ID,
    environment: 'master',
    accessToken: process.env.ACCESS_TOKEN,
  })

  // changed content_type id from sfEvictors to just evictors on the
  // online GUI but it's not updating for the API response LOL
  const result = (await client
    .getEntries({content_type: 'sfEvictors'})
    .catch(console.error)) as EntryCollection<any>

  const evictors = result.items
    .filter((item) => item.fields.city === 'oakland')
    .map(async (item) => {
      try {
        // pullQuote + citywideListDescription has way too many fields to query
        // ergonomically, so we'll just grab it as a string
        // this is how the contentful cms presents it too
        const {
          ebLink,
          type,
          name,
          city,
          pullQuote,
          citywideListDescription,
        } = item.fields
        if (!ebLink || !type) return
        const ebData = await getEBEntry(ebLink, type, city).catch(
          (err) => {
            console.error(`Error on ${name}, ${ebLink}: ${err}`)
          }
        )

        const totalEvictions = ebData.evictions.length

        return {
          ...item.fields,
          id: item.sys.id,
          ebData,
          totalEvictions,
          pullQuote: {raw: JSON.stringify(pullQuote)},
          citywideListDescription: {
            raw: JSON.stringify(citywideListDescription),
          },
        }
      } catch (e) {
        console.error(`${e}: ${item.fields.name}`)
      }
    })
    .filter((evictor) => evictor) // 'undefined' is falsy

  const resolved = (await Promise.all(evictors)).sort(
    (a, b) => a.rank - b.rank
  )

  return resolved
}
