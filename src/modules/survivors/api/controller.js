import Survivor from '../model';

const itemsTheSurvivor = { water: 4, food: 3, medication: 2, ammunition: 1 };

const checkItemsList = (survivorList, requestList) => {
  if (survivorList.length >= requestList.length) {
    const arrayAux = survivorList.slice();
    for (let i = 0; i < requestList.length; i++) {
      for (let j = 0; j < survivorList.length; j++) {
        if (survivorList[j].points === requestList[i].points) {
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

const getPercentageOfSanity = (req, res, infectedBoolean) => {
  Survivor.count(
    {},
    (err, allSurvivors) => {
      if (err) {
        res.send(err);
      }
      Survivor.aggregate(
        { $match: { isInfected: infectedBoolean } },
        { $group: { _id: '$isInfected', count: { $sum: 1 } } },
        { $project: { percentage: { $multiply: ['$count', 100 / allSurvivors] } } },
        (error, percentage) => {
          if (error) {
            res.send(error);
          }
          res.send({ percentage });
        }
      );
    }
  );
};

const getAverageResourceBySurvivor = (req, res, resource) => {
  Survivor.count(
    {},
    (err, allSurvivors) => {
      if (err) {
        res.send(err);
      }
      console.log(resource);
      Survivor.aggregate(
        // Unwind the array
        { $unwind: '$inventory' },
        {
          $group: {
            _id: null,
            count: {
              $sum: {
                $cond: [{ $eq: ['$inventory.points', resource] }, 1, 0]
              }
            }
          }
        },
        { $project: { _id: 0, average: { $divide: ['$count', allSurvivors] } } },
        (error, result) => {
          if (error) {
            res.send(error);
          }
          res.send({
            message: `The average of ${req.query.resource} per survivor is ${result[0].average}`
          });
        }
      );
    }
  );
};

const controller = {

  getAllSurvivors: (req, res) => {
    Survivor.find({}, (err, survivors) => {
      if (err) {
        res.status(500).json({ error: err });
      }
      res.json(survivors);
    });
  },

  getSurvivorById: (req, res) => {
    Survivor.findOne({ _id: req.params.id }, (err, survivor) => {
      if (err) {
        res.status(500).json({ error: err });
        return;
      }
      res.status(200).json(survivor);
    });
  },

  createSurvivor: (req, res) => {
    Survivor.create(req.body, (err, survivor) => {
      if (err) {
        res.status(500).json({ error: err });
      }
      res.status(201).json(survivor);
    });
  },

  updateSurvivor: (req, res) => {
    const query = { _id: req.params.id };
    Survivor.findOneAndUpdate(
      query,
      { $set: { lastLocation: req.body.lastLocation } },
      { new: true },
      (err, survivor) => {
        if (err) {
          res.json(err);
        }
        res.json(survivor);
      }
    );
  },

  marketsItemsBetweenSurvivors: (req, res) => {
    let scoreOfItensSurvivorOne = 0;
    let scoreOfItensSurvivorTwo = 0;
    const itemsOfSurvivorOne = req.body[0].items;
    const itemsOfSurvivorTwo = req.body[1].items;
    if (!itemsOfSurvivorOne || !itemsOfSurvivorTwo) {
      res.json({ message: 'Not have items for trade, try again' });
    }
    for (let i = 0, length = itemsOfSurvivorOne.length; i < length; i++) {
      scoreOfItensSurvivorOne += itemsOfSurvivorOne[i].points;
    }
    for (let i = 0, length = itemsOfSurvivorTwo.length; i < length; i++) {
      scoreOfItensSurvivorTwo += itemsOfSurvivorTwo[i].points;
    }
    if (scoreOfItensSurvivorOne === scoreOfItensSurvivorTwo) {
      Survivor.find({
        _id: {
          $in: [
            req.body[0].id,
            req.body[1].id,
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
          res.json({
            message: `These survivors are infected, ${hasSomeSurvivorInfected} try other again`
          });
        }
        let itemSurvivorFoundOne = null;
        let itemSurvivorFoundTwo = null;

        // see who on result is a survivor requested
        if (survivors[0]._id === req.body[0].id) {
          itemSurvivorFoundOne = survivors[0].inventory;
          itemSurvivorFoundTwo = survivors[1].inventory;
        } else {
          itemSurvivorFoundOne = survivors[1].inventory;
          itemSurvivorFoundTwo = survivors[0].inventory;
        }


        if (checkItemsList(itemSurvivorFoundOne, req.body[0].items) &&
          checkItemsList(itemSurvivorFoundTwo, req.body[1].items)) {
          // res.json({ message: 'you can do trade' });
          const itemsTradingTheSurvivorOne = findItemsId(itemSurvivorFoundOne, req.body[0].items);
          const itemsTradingTheSurvivorTwo = findItemsId(itemSurvivorFoundTwo, req.body[1].items);

          console.log(itemsTradingTheSurvivorOne);
          console.log(itemsTradingTheSurvivorTwo);
          Survivor.findOneAndUpdate(
            { _id: req.body[0].id },
            { $pull: { 'inventory': { $elemMatch: { _id: itemsTradingTheSurvivorOne } } } },
            { new: true },
            (error, survivor) => {
              if (error) {
                res.json(error);
              }
              Survivor.findOneAndUpdate(
                { _id: req.body[1].id },
                { $pull: { 'inventory': { $elemMatch: { _id: itemsTradingTheSurvivorTwo } } } },
                { new: true },
                (error, survivor) => {
                  if (error) {
                    res.json(error);
                  }
                  Survivor.findOneAndUpdate(
                    { _id: req.body[0].id },
                    { $push: { 'inventory': { $each: req.body[1].items } } },
                    { new: true },
                    (error, survivorOne) => {
                      if (error) {
                        res.json(error);
                      }
                      Survivor.findOneAndUpdate(
                        { _id: req.body[1].id },
                        { $push: { 'inventory': { $each: req.body[0].items } } },
                        { new: true },
                        (error, survivorTwo) => {
                          if (error) {
                            res.json(error);
                          }
                          res.json({ survivorOne, survivorTwo });
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        } else {
          res.json({ message: 'Items not found' });
        }
      });
    } else {
      res.json({ message: 'your trading must have the same points, try again' });
    }
  },

  markedAsInfected: (req, res) => {
    const query = { _id: req.params.infected_id };

    Survivor.findById(
      query,
      (err, survivor) => {
        if (err) {
          res.json(err);
        }
        let hasIndicated = -1;
        if (survivor.indications.length) {
          hasIndicated = survivor.indications.map((indication) => {
            return indication.author;
          }).indexOf(req.params.id);
        }
        if (hasIndicated !== -1 || survivor.indications.length === 0) {
          survivor.indications.push({ author: req.params.id });
          survivor.save((error) => {
            if (error) {
              res.send(error);
            }
            res.json({ message: 'survivor was indicated!', survivor });
          });
        } else {
          res.json({ message: 'you already indicated this survivor as infected try another' });
        }
      }
    );
  },

  getReportSurvivors: (req, res) => {
    if (req.query.hasOwnProperty('infected')) {
      getPercentageOfSanity(req, res, req.query.infected);
    } else if (req.query.hasOwnProperty('resource')) {
      let resource = null;
      switch (req.query.resource.toLowerCase()) {
        case 'water':
          resource = itemsTheSurvivor.water;
          break;
        case 'food':
          resource = itemsTheSurvivor.food;
          break;
        case 'medication':
          resource = itemsTheSurvivor.medication;
          break;
        case 'ammunition':
          resource = itemsTheSurvivor.ammunition;
        default:
          res.json({
            message: 'params invalid consult the documentation, you have put water, food and etc'
          });
      }
      getAverageResourceBySurvivor(req, res, resource);
    }
  },

  getPointsLost: (req, res) => {
    Survivor.aggregate(
      { $unwind: '$inventory' },
      { $match: { isInfected: true } },
      { $group: { _id: null, count: { $sum: '$inventory.points' } } },
      { $project: { _id: 0, pointsLost: '$count' } },
      (error, result) => {
        if (error) {
          res.send(error);
        }
        res.send({ result });
      }
    );
  }
};

export default controller;
