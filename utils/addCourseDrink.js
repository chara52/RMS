export function addCourseDrink(course, drink) {

  if (
    (!Array.isArray(course) || course.length === 0 || course[0] === "なし") &&
    (!Array.isArray(drink) || drink.length === 0 || drink[0] === "なし")
  ) {
    return "";
  }

  const CP = course.map(price => Number(price));
  const sumCP = CP.reduce((acc, cur) => acc + cur, 0);

  let DP = 0;
  if (Array.isArray(drink) && drink.length > 0 && Array.isArray(course) && course.length > 0 && course[0] !== "なし" && drink[0] !== "なし") {
    const trimmedDrink = drink[0].trim();

    if (trimmedDrink === "2500円（2h）") {
      DP = 2500;
      return `${sumCP + DP}込`;
    } else if (trimmedDrink === "3000円（3h）") {
      DP = 3000;
      return `${sumCP + DP}込(3h)`;
    }
  } else if (Array.isArray(drink) && drink.length > 0 && course[0] === "なし" || course.length === 0) {
    const trimmedDrink = drink[0].trim();

    if (trimmedDrink === "2500円（2h）") {
      DP = 2500;
      return `飲み放題(2h)`;
    } else if (trimmedDrink === "3000円（3h）") {
      DP = 3000;
      return `飲み放題(3h)`;
    }
  } else if (Array.isArray(course) && course.length > 0 && drink[0] === "なし" || drink.length === 0) {
    return `${sumCP}別`;
  }
}
