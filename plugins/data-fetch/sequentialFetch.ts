const asyncDelay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Evictorbook API frustratingly returns errors when hit moderately quickly,
 * so this function helps make fetch requests sequentially (versus
 * concurrently, default).
 * @param cbs Arbitary callbacks that return a promise when executed
 * @param limit How many concurrent callbacks to execute at once
 * @param delay In milliseconds, time between sequential callbacks
 * @returns
 */
export async function sequentialFetch(
  cbs: (() => Promise<any>)[],
  limit = 1,
  delay = 50
): Promise<any> {
  const execCb = async (
    arr: (() => Promise<any>)[],
    results = []
  ) => {
    const execItem = arr.shift()
    if (execItem) {
      const result = await execItem()
      results.push(result)
      await asyncDelay(delay)
      return await execCb(arr, results)
    } else {
      return results
    }
  }
  const results = []
  const promises = Array(limit)
    .fill(0)
    .map(() => execCb(cbs, results))
  await Promise.all(promises)
  return results
}
