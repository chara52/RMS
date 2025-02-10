export function sortReservationsByTime(reservations) {
  return reservations.sort((a, b) => new Date(a.time) - new Date(b.time))
}
