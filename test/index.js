import chai from 'chai';
import chaiHttp from 'chai-http';
import mongoose from 'mongoose';
const should = chai.should();
const expect = chai.expect;
import server from '../src/index';
import Survivor from '../src/modules/survivors/model';

chai.use(chaiHttp);

// ensure the NODE_ENV is set to 'test'
// this is helpful when you would like to change behavior when testing
// process.env.NODE_ENV = 'test';

const mockSurvivors = [
  {
    name: 'Survivor Brown',
    age: '34',
    gender: 'male',
    lastLocation: [
      17,
      77
    ],
    isInfected: false,
    indications: [],
    inventory: [
      {
        name: 'Food',
        points: 3
      }
    ]
  },
  {
    name: 'Survivor Rock',
    age: '34',
    gender: 'male',
    lastLocation: [
      67,
      -7
    ],
    isInfected: false,
    indications: [],
    inventory: [
      {
        name: 'Medication',
        points: 2
      },
      {
        name: 'Ammunition',
        points: 1
      }
    ]
  }
];


describe('Survivors', () => {
  beforeEach((done) => {
    Survivor.create(
      mockSurvivors,
      (err) => {
        if (err) {
          console.error(err);
        }
        done();
      }
    );
  });

  afterEach((done) => {
    for (let i in mongoose.connection.collections) {
      mongoose.connection.collections[i].remove();
    }
    return done();
  });

  it('should list ALL survivors on /api/survivors GET', (done) => {
    chai.request(server)
      .get('/api/survivors')
      .end((err, res) => {
        console.log(res.body[0]);
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');
        res.body[0].inventory[0].name.should.equal('Food');
        res.body[0].inventory[0].points.should.equal(3);
        res.body[0].age.should.equal('34');
        res.body[0].isInfected.should.equal(false);
        res.body[0].gender.should.equal('male');
        res.body[0].name.should.equal('Survivor Brown');
        done();
      });
  });


  it('should list a SINGLE survivor on /api/survivor/<id> GET', (done) => {
    Survivor.create(
      {
        name: 'Dilmãe',
        age: '67',
        gender: 'female',
        lastLocation: [
          9,
          -45
        ],
        isInfected: false,
        inventory: [{
          name: 'Water',
          points: 4
        }]
      },
      (err, newSurvivor) => {
        if (err) {
          console.error(err);
        }
        chai.request(server)
          .get(`/api/survivors/${newSurvivor._id}`)
          .end((err, res) => {
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.be.a('object');
            res.body.name.should.equal('Dilmãe');
            res.body.age.should.equal('67');
            res.body.isInfected.should.equal(false);
            res.body.gender.should.equal('female');
            res.body.inventory[0].name.should.equal('Water');
            res.body.inventory[0].points.should.equal(4);
            done();
          });
      }
    );
  });

  it('should add a SINGLE survivor on /api/survivors POST', (done) => {
    const newSurvivor = {
      name: 'James Brown',
      age: '54',
      gender: 'male',
      lastLocation: [
        17,
        6
      ],
      isInfected: false,
      indications: [],
      inventory: [{
        name: 'Food',
        points: 3
      }]
    };
    chai.request(server)
      .post('/api/survivors/')
      .send(newSurvivor)
      .end((err, res) => {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.name.should.equal('James Brown');
        res.body.age.should.equal('54');
        res.body.isInfected.should.equal(false);
        res.body.gender.should.equal('male');
        res.body.inventory[0].name.should.equal('Food');
        res.body.inventory[0].points.should.equal(3);
        done();
      });
  });

  it('should update the location SINGLE survivor on /api/survivors/<id> PUT', (done) => {
    chai.request(server)
      // get survivor created in beforeEach
      .get('/api/survivors')
      .end((err, res) => {
        res.should.have.status(200);
        chai.request(server)
          .put(`/api/survivors/${res.body[0]._id}`)
          .send({ lastLocation: [33, 55] })
          .end((error, response) => {
            response.should.have.status(200);
            response.body.should.be.a('object');
            expect(response.body).to.have.deep.property('lastLocation[0]', 33);
            expect(response.body).to.have.deep.property('lastLocation[1]', 55);
            done();
          });
      });
  });

  it('Survivor should accuses other as infected on /api/survivors/<id>/report/<infected_id> PUT',
    (done) => {
      chai.request(server)
        // get survivors created in beforeEach
        .get('/api/survivors')
        .end((err, res) => {
          res.should.have.status(200);
          chai.request(server)
            .put(`/api/survivors/${res.body[0]._id}/report/${res.body[1]._id}`)
            .end((error, response) => {
              response.should.have.status(200);
              response.body.survivor.should.be.a('object');
              expect(response.body.survivor).to.have.deep.property(
                'indications[0].author',
                res.body[0]._id
              );
              done();
            });
        });
    });

  it('Markets items between two survivors /api/survivors/trade/items PUT', (done) => {
    const arrayOfSurvivors = [];
    chai.request(server)
      // get survivors created in beforeEach
      .get('/api/survivors')
      .end((err, res) => {
        res.should.have.status(200);
        for (let i = 0, length = res.body.length; i < length; i++) {
          arrayOfSurvivors.push({
            id: res.body[i]._id,
            items: res.body[i].inventory
          });
        }
        chai.request(server)
          .put('/api/survivors/trade/items')
          .send(arrayOfSurvivors)
          .end((error, response) => {
            response.should.have.status(200);
            console.log(response.body);
            response.body.should.be.a('object');
            expect(response.body.survivorOne).to.have.deep.property(
              'inventory[0].name',
              res.body[1].inventory[0].name
            );
            expect(response.body.survivorOne).to.have.deep.property(
              'inventory[0].points',
              res.body[1].inventory[0].points
            );
            expect(response.body.survivorTwo).to.have.deep.property(
              'inventory[0].name',
              res.body[0].inventory[0].name
            );
            expect(response.body.survivorTwo).to.have.deep.property(
              'inventory[0].points',
              res.body[0].inventory[0].points
            );
            done();
          });
      });
  });
});
