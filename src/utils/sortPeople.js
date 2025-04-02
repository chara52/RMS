export function sortPeople(reservations) {
  return reservations.sort((a, b) => {
    const peopleA = parseInt(a.people);
    const peopleB = parseInt(b.people);

    return peopleB - peopleA;
  })
}
