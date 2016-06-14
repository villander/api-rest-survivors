import mongoose from 'mongoose';
import survivorSchema from './schema';

const Survivor = mongoose.model('Survivor', survivorSchema);
const checkItemsList = (survivorList, requestList) => {
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
};
const findItemsId = (survivorList, requestList) => {
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
};
const survivorMethods = {
  getAll(callback) {
    Survivor.find({}, (err, survivors) => {
      if (err) {
        callback(err);
      }
      callback(null, survivors);
    }).sort({ name: 'asc' });
  },
  create(newSurvivor, callback) {
    Survivor.create(newSurvivor, (err, survivor) => {
      if (err) {
        callback(err);
      }
      callback(null, survivor);
    });
  },
  getById(id, callback) {
    Survivor.findOne({ _id: id }, (err, survivor) => {
      if (err) {
        callback(err);
      }
      callback(null, survivor);
    });
  },
  updateLocation(id, newLocation, callback) {
    const query = { _id: id };
    Survivor.findOneAndUpdate(query,
      { $set: { lastLocation: newLocation } },
      { new: true },
      (err, survivor) => {
        if (err) {
          callback(err);
        }
        callback(null, survivor);
      });
  },
  markAsInfected(id, infectedId, callback) {
    const query = { _id: infectedId };
    Survivor.findById(query, (err, survivor) => {
      if (err) {
        callback(err);
      }
      let hasIndicated = -1;
      if (survivor.indications.length) {
        hasIndicated = survivor.indications.map((indication) => {
          return indication.author;
        }).indexOf(id);
      }
      if (hasIndicated === -1) {
        survivor.indications.push({ author: id });
        survivor.save((error, survivorInfected) => {
          if (error) {
            callback(error);
          }
          callback(null, survivorInfected);
        });
      } else {
        callback(null, { message: 'you already indicated this survivor as infected try another' });
      }
    });
  },
  getPointsLost(callback) {
    Survivor.aggregate(
      { $unwind: '$inventory' },
      { $match: { isInfected: true } },
      { $group: { _id: null, count: { $sum: '$inventory.points' } } },
      { $project: { _id: 0, pointsLost: '$count' } },
      (error, result) => {
        if (error) {
          callback(error);
        }
        callback(null, result);
      });
  },
  getPercentageOfSanity(infectedBoolean, callback) {
    Survivor.count({}, (err, allSurvivors) => {
      if (err) {
        callback(err);
      }
      Survivor.aggregate(
        { $match: { isInfected: infectedBoolean } },
        { $group: { _id: '$isInfected', count: { $sum: 1 } } },
        { $project: { _id: 0, percentage: { $multiply: ['$count', 100 / allSurvivors] } } },
        (error, result) => {
          if (error) {
            callback(error);
          }
          callback(null, { result });
        });
    });
  },
  getAverageResourceBySurvivor(resource, callback) {
    Survivor.count({}, (err, allSurvivors) => {
      if (err) {
        callback(err);
      }
      Survivor.aggregate({ $unwind: '$inventory' },
        {
          $group: {
            _id: null,
            count: {
              $sum: { $cond: [{ $eq: ['$inventory.points', resource] }, 1, 0] }
            }
          }
        },
        { $project: { _id: 0, average: { $divide: ['$count', allSurvivors] } } },
        (error, result) => {
          if (error) {
            callback(error);
          }
          callback(null, { result });
        });
    });
  },
  tradeItemsBetweenTwoSurvivors(survivorOne, survivorTwo, callback) {
    Survivor.find({
      _id: {
        $in: [
          survivorOne.id,
          survivorTwo.id,
        ]
      }
    }, (err, survivors) => {
      const hasSomeSurvivorInfected = [];
      if (survivors[0].isInfected) {
        hasSomeSurvivorInfected.push(survivors[0].name);
      } else if (survivors[1].isInfected) {
        hasSomeSurvivorInfected.push(survivors[1].name);
      }
      if (hasSomeSurvivorInfected.length > 0) {
        callback({
          message: `These survivors are infected, ${hasSomeSurvivorInfected} try other again`
        });
      }
      let itemSurvivorFoundOne = null;
      let itemSurvivorFoundTwo = null;
      let requestListOne = null;
      let requestListTwo = null;

      // see who on result is a survivor requested
      if (survivors[0]._id === survivorOne.id) {
        itemSurvivorFoundOne = survivors[0].inventory;
        itemSurvivorFoundTwo = survivors[1].inventory;
        requestListOne = survivorOne.items;
        requestListTwo = survivorTwo.items;
      } else {
        itemSurvivorFoundOne = survivors[1].inventory;
        itemSurvivorFoundTwo = survivors[0].inventory;
        requestListOne = survivorTwo.items;
        requestListTwo = survivorOne.items;
      }


      if (checkItemsList(itemSurvivorFoundOne, requestListOne) &&
        checkItemsList(itemSurvivorFoundTwo, requestListTwo)) {
        // callback({ message: 'you can do trade' });
        const itemsTradingTheSurvivorOne = findItemsId(itemSurvivorFoundOne, survivorOne.items);
        const itemsTradingTheSurvivorTwo = findItemsId(itemSurvivorFoundTwo, survivorTwo.items);

        Survivor.findOneAndUpdate(
          { _id: survivorOne.id },
          { $pull: { 'inventory': { $elemMatch: { _id: itemsTradingTheSurvivorOne } } } },
          { new: true },
          (error) => {
            if (error) {
              callback(error);
            }
            Survivor.findOneAndUpdate(
              { _id: survivorTwo.id },
              { $pull: { 'inventory': { $elemMatch: { _id: itemsTradingTheSurvivorTwo } } } },
              { new: true },
              (error) => {
                if (error) {
                  callback(error);
                }
                Survivor.findOneAndUpdate(
                  { _id: survivorOne.id },
                  { $push: { 'inventory': { $each: survivorTwo.items } } },
                  { new: true },
                  (error, survivorOneUpdated) => {
                    if (error) {
                      callback(error);
                    }
                    Survivor.findOneAndUpdate(
                      { _id: survivorTwo.id },
                      { $push: { 'inventory': { $each: survivorOne.items } } },
                      { new: true },
                      (error, survivorTwoUpdated) => {
                        if (error) {
                          callback(error);
                        }
                        callback(null, { survivorOneUpdated, survivorTwoUpdated });
                      });
                  });
              });
          });
      } else {
        callback(null, { message: 'Items not found' });
      }
    });
  }
};

export default survivorMethods;


