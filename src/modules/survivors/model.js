import mongooseAsModule from 'mongoose';
import Promise from 'bluebird';
import survivorSchema from './schema';
import { ifHasSameItens } from '../../helpers/ifHasSameItens';
import { extracItensOfSurvivor } from '../../helpers/extracItensOfSurvivor';

const mongoose = Promise.promisifyAll(mongooseAsModule);
const Survivor = mongoose.model('Survivor', survivorSchema);

const survivorMethods = {
  getAll(callback) {
    Survivor.find({}).sort({ name: 'asc' })
      .then((survivors) => {
        return callback(null, survivors);
      })
      .catch((err) => {
        return callback(err);
      });
  },
  create(newSurvivor, callback) {
    Survivor.create(newSurvivor)
      .then((survivor) => {
        return callback(null, survivor);
      })
      .catch((err) => {
        return callback(err);
      });
  },
  getById(id, callback) {
    const query = { _id: id };
    Survivor.findOne(query)
      .then((survivor) => {
        return callback(null, survivor);
      })
      .catch((err) => {
        return callback(err);
      });
  },
  updateLocation(id, newLocation, callback) {
    const query = { _id: id };
    Survivor.findOneAndUpdate(query,
      { $set: { lastLocation: newLocation } },
      { new: true })
      .then((survivor) => {
        return callback(null, survivor);
      })
      .catch((err) => {
        return callback(err);
      });
  },
  markAsInfected(id, infectedId, callback) {
    const query = { _id: infectedId };
    Survivor.findById(query)
      .then((survivor) => {
        let hasIndicated = -1;
        if (survivor.indications.length) {
          hasIndicated = survivor.indications.map((indication) => {
            return indication.author;
          }).indexOf(id);
        }
        if (hasIndicated === -1) {
          survivor.indications.push({ author: id });
          return survivor.save();
        } else {
          return callback(null, { message: 'you already indicated this survivor as infected try another' });
        }
      })
      .then((survivorInfected) => {
        return callback(null, survivorInfected);
      })
      .catch((err) => {
        return callback(err);
      });
  },
  getPointsLost(callback) {
    Survivor.aggregate(
      { $unwind: '$inventory' },
      { $match: { isInfected: true } },
      { $group: { _id: null, count: { $sum: '$inventory.points' } } },
      { $project: { _id: 0, pointsLost: '$count' } }).execAsync()
      .then((result) => {
        return callback(null, result);
      })
      .catch((err) => {
        return callback(err);
      });
  },
  getPercentageOfSanity(infectedBoolean, callback) {
    Survivor.count({})
      .then((allSurvivors) => {
        return Survivor.aggregate(
          { $match: { isInfected: infectedBoolean } },
          { $group: { _id: '$isInfected', count: { $sum: 1 } } },
          {
            $project: {
              _id: 0,
              percentage: { $multiply: ['$count', 100 / allSurvivors] }
            }
          }).execAsync();
      })
      .then((result) => {
        return callback(null, { result });
      })
      .catch((error) => {
        return callback(error);
      });
  },
  getAverageResourceBySurvivor(resource, callback) {
    Survivor.count({})
      .then((allSurvivors) => {
        return Survivor.aggregate({ $unwind: '$inventory' },
          {
            $group: {
              _id: null,
              count: {
                $sum: { $cond: [{ $eq: ['$inventory.points', resource] }, 1, 0] }
              }
            }
          },
          { $project: { _id: 0, average: { $divide: ['$count', allSurvivors] } } }).execAsync();
      })
      .then((result) => {
        return callback(null, { result });
      })
      .catch((error) => {
        return callback(error);
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
    })
      .then((survivors) => {
        const hasSomeSurvivorInfected = [];
        if (survivors[0].isInfected) {
          hasSomeSurvivorInfected.push(survivors[0].name);
        } else if (survivors[1].isInfected) {
          hasSomeSurvivorInfected.push(survivors[1].name);
        }
        if (hasSomeSurvivorInfected.length > 0) {
          return callback(null, hasSomeSurvivorInfected);
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

        if (ifHasSameItens(itemSurvivorFoundOne, requestListOne) &&
          ifHasSameItens(itemSurvivorFoundTwo, requestListTwo)) {
          // callback({ message: 'you can do trade' });
          const itemsOfSurvivorOne = extracItensOfSurvivor(itemSurvivorFoundOne, survivorOne.items);
          const itemsOfSurvivorTwo = extracItensOfSurvivor(itemSurvivorFoundTwo, survivorTwo.items);

          const moveItemSurvivorOne = Survivor.findOneAndUpdate({ _id: survivorOne.id },
            { $pull: { inventory: { $elemMatch: { _id: itemsOfSurvivorOne } } } },
            { new: true });

          const moveItemSurvivorTwo = Survivor.findOneAndUpdate({ _id: survivorTwo.id },
            { $pull: { inventory: { $elemMatch: { _id: itemsOfSurvivorTwo } } } },
            { new: true });
          return Promise.all([moveItemSurvivorOne, moveItemSurvivorTwo]);
        }
        return callback(null, { message: 'Items not found' });
      })
      .then(() => {
        const putItemSurvivorOne = Survivor.findOneAndUpdate({ _id: survivorOne.id },
          { $push: { inventory: { $each: survivorTwo.items } } },
          { new: true });
        const putItemSurvivorTwo = Survivor.findOneAndUpdate({ _id: survivorTwo.id },
          { $push: { inventory: { $each: survivorOne.items } } },
          { new: true });
        return Promise.all([putItemSurvivorOne, putItemSurvivorTwo]);
      })
      .then((survivorsUpdated) => {
        const survivorOneUpdated = survivorsUpdated[0];
        const survivorTwoUpdated = survivorsUpdated[1];
        return callback(null, { survivorOneUpdated, survivorTwoUpdated });
      })
      .catch((error) => {
        return callback(error);
      });
  }
};

export default survivorMethods;
