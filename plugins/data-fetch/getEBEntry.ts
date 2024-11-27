const domain = process.env.EB_DOMAIN || 'https://evictorbook.com/'
const BASE = `${domain}/api/owner`

/** ts for some reason keeps wanting an async function (even though no
 * await ??) so... */
async function getSlice(ebName: string, slice: string): Promise<any> {
  const escaped = encodeURI(`${BASE}/${ebName}/${slice}`)
  const text = await fetch(escaped)
    .then((res) => res.text())
    .catch((err) => {
      throw new Error(`${escaped}: ${err}`)
    })

  let result
  try {
    result = JSON.parse(text).records
  } catch (err) {
    throw new Error(`${escaped}: ${err} ${text}`)
  }

  return {[slice]: result}
}

export default async function getEBEntry(ebName: string) {
  const slices = [
    'details',
    'evictions',
    'networkDetails',
    'portfolio',
  ]

  const escaped = encodeURI(`${domain}/owner/${ebName}`)
  const result = await Promise.all(
    slices.map((slice) => getSlice(ebName, slice))
  )

  // array of objects with single (unique) property into single object
  return result.reduce(
    (prev, curr) => ({...prev, ...curr, ebUrl: escaped}),
    {}
  )
}
