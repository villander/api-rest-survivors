export function extracItensOfSurvivor(survivorList, requestList) {
  const arrayOfItemsId = [];
  for (let i = 0; i < survivorList.length; i++) {
    for (let j = 0; j < requestList.length; j++) {
      if (survivorList[i].points === requestList[j].points) {
        arrayOfItemsId.push(survivorList[i]._id);
        break;
      }
    }
  }
  return arrayOfItemsId;
}

