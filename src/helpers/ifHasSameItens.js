// considering that each item has different points,
// the point property can be a unique identifier.
export function ifHasSameItens(survivorList, requestList) {
  if (survivorList.length >= requestList.length) {
    const arrayAux = survivorList.slice();
    for (let i = 0; i < survivorList.length; i++) {
      for (let j = 0; j < requestList.length; j++) {
        if (requestList[j].points === survivorList[i].points) {
          arrayAux.splice(arrayAux.indexOf(j), 1);
          break;
        }
      }
    }
    if (arrayAux.length === (survivorList.length - requestList.length)) {
      return true;
    }
  }
  return false;
}
