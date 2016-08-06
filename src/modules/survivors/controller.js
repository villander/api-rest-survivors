import Survivor from './model';

const itemsTheSurvivor = { water: 4, food: 3, medication: 2, ammunition: 1 };

const controller = {
  getAllSurvivors(req, res) {
    Survivor.getAll((err, survivors) => {
      if (err) {
        res.status(500).json({ error: err });
      }
      res.json(survivors);
    });
  },
  getSurvivorById(req, res) {
    Survivor.getById(req.params.id, (err, survivor) => {
      if (err) {
        res.status(500).json({ error: err });
        return;
      }
      res.status(200).json(survivor);
    });
  },
  createSurvivor(req, res) {
    Survivor.create(req.body, (err, survivor) => {
      if (err) {
        res.status(500).json({ error: err });
      }
      res.status(201).json(survivor);
    });
  },
  updateSurvivor(req, res) {
    Survivor.updateLocation(req.params.id,
      req.body.lastLocation,
      (err, survivor) => {
        if (err) {
          res.json({ error: err });
        }
        res.json(survivor);
      });
  },
  markedAsInfected(req, res) {
    Survivor.markAsInfected(req.params.id,
      req.params.infected_id,
      (err, survivor) => {
        if (err) {
          res.status(500).json({ error: err });
        }
        res.json(survivor);
      });
  },
  getPointsLost(req, res) {
    Survivor.getPointsLost((error, result) => {
      if (error) {
        res.json(error);
      }
      if (result.length) {
        res.json({ result });
      } else {
        res.json({ result: 0 });
      }
    });
  },
  marketsItemsBetweenSurvivors(req, res) {
    let scoreOfItensSurvivorOne = 0;
    let scoreOfItensSurvivorTwo = 0;
    const itemsOfSurvivorOne = req.body[0].items.length;
    const itemsOfSurvivorTwo = req.body[1].items.length;
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
      Survivor.tradeItemsBetweenTwoSurvivors(req.body[0], req.body[1], (err, result) => {
        if (err) {
          res.status(500).json({ error: err });
        }
        res.json(result);
      });
    } else {
      res.json({ message: 'your trading must have the same points, try again' });
    }
  },
  getReportSurvivors(req, res) {
    if (req.query.hasOwnProperty('infected')) {
      Survivor.getPercentageOfSanity(req.query.infected,
        (err, result) => {
          if (err) {
            res.status(500).json({ error: err });
          }
          res.json(result);
        });
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
          break;
        default:
          res.json({
            message: 'params invalid consult the documentation, you have put water, food and etc'
          });
      }
      Survivor.getAverageResourceBySurvivor(resource,
        (err, result) => {
          if (err) {
            res.status(500).json({ error: err });
          }
          res.json(result);
        });
    }
  }
};

export default controller;
