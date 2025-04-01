export function sortReservations(reservations) {
  return reservations.sort((a, b) => {
    const dateA = new Date(a.time)
    const dateB = new Date(b.time)
    return dateA - dateB
  })
}
