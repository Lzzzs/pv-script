export function getCurrentTime() {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = padZero(currentDate.getMonth() + 1)
  const currentDay = padZero(currentDate.getDate())

  return `${currentYear}-${currentMonth}-${currentDay}`
}

export function padZero(number: number) {
  return number < 10 ? `0${number}` : number
}
