export function sortSeat(reservations) {
  return reservations.sort((a, b) => {
    const seatA = extractSeatNumber(a.seat);
    const seatB = extractSeatNumber(b.seat);
    return seatA - seatB;
  });
}

function extractSeatNumber(seat) {
  const match = seat.match(/\d+/);
  const num = parseInt(match);
  return num;
}
