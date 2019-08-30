export const addTimezoneOffset = (dateString: string) => {
  const date = new Date(dateString)
  const timeOffsetInMS = date.getTimezoneOffset() * 60000
  const dateWithOffset = date.setTime(date.getTime() + timeOffsetInMS)
  return new Date(dateWithOffset)
}
