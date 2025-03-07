export function addCourseDrink(course, drink) {
  console.log("ドリンク", drink);

  const CP = course.map(price => Number(price));
  const sumCP = CP.reduce((acc, cur) => acc + cur, 0);

  let DP = 0;
  if (Array.isArray(drink) && drink.length > 0) {
    const trimmedDrink = drink[0].trim();

    if (trimmedDrink === "2500円（2h）") {
      DP = 2500;
    } else if (trimmedDrink === "3000円（3h）") {
      DP = 3000;
    } else {
      console.log("該当するドリンクがありません");
    }
  }

  return `${sumCP + DP}込`;
}
