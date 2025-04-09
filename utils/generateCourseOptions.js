export function generateCourseOptions() {
  const prices = ["席のみ予約"]

  for (let start = 2500; start <= 10000; start += 500) {
    prices.push(start)
  }
  return prices
}
