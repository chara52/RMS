export function sortSeat(reservations) {
  return reservations.sort((a, b) => {
    const seatA = extractSeatNumber(a.seat);
    const seatB = extractSeatNumber(b.seat);
    return seatA - seatB;
  });
}

function extractSeatNumber(seat) {
  if (typeof seat !== 'string') return Number.MIN_SAFE_INTEGER;

  const match = seat.match(/\d+/);
  if (!match) return Number.MIN_SAFE_INTEGER;

  return parseInt(match[0], 10);
}
