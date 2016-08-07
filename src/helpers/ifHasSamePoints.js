export function ifHasSamePoints(firstArray, secondArray) {
  let scoreOfFirstArray = 0;
  let scoreOfSecondArray = 0;
  for (let i = 0, length = firstArray.length; i < length; i++) {
    scoreOfFirstArray += firstArray[i].points;
  }
  for (let i = 0, length = secondArray.length; i < length; i++) {
    scoreOfSecondArray += secondArray[i].points;
  }
  return scoreOfFirstArray === scoreOfSecondArray;
}
