export function generateCourseOptions() {
  const prices = []

  for (let start = 2500; start <= 12000; start += 500) {
    prices.push(`${start}`)
  }
  return prices
}
