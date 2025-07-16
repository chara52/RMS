export const isValidBirthdayFormat = (str: string): boolean => {
  // 8桁の数字以外を除外
  if (!/^\d{8}$/.test(str)) return false

  const year: number = Number(str.slice(0, 4))
  const month: number = Number(str.slice(4, 6)) - 1
  const day: number = Number(str.slice(6, 8))

  const date: Date = new Date(year, month, day)

  // 存在しない日付を除外
  const isValidDate =
    date.getFullYear() === year && date.getMonth() === month && date.getDate() === day

  if (!isValidDate) return false

  // 未来の日付を除外
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return date <= today
}
