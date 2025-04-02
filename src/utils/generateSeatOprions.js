export function generateSeatOptions() {
  const seats = [];

  for (let start = 1; start <= 4; start += 1) {
    seats.push(start);
  }

  for (let start = 10; start <= 14; start += 1) {
    seats.push(start);
  }

  for (let start = 21; start <= 24; start += 1) {
    seats.push(start);
  }

  for (let start = 51; start <= 53; start += 1) {
    seats.push(start);
  }

  return seats;
}
