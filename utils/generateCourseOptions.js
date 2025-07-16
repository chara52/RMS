export function generateCourseOptions() {
  const options = [{value: "なし", label: "なし"}]

  for (let start = 2500; start <= 10000; start += 500) {
    options.push({value: start.toString(), label: `${start}円`})
  }
  return options
}
