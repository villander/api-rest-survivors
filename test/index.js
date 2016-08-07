import chai from 'chai';
import chaiHttp from 'chai-http';
import mongoose from 'mongoose';
const should = chai.should();
const expect = chai.expect;
import server from '../src/index';
import Survivor from '../src/modules/survivors/model';
import * as survivorsDummy from './FIXTURES/survivors';

chai.use(chaiHttp);

// ensure the NODE_ENV is set to 'test'
// this is helpful when you would like to change behavior when testing
// process.env.NODE_ENV = 'test';

describe('Survivors', () => {
  beforeEach((done) => {
    Survivor.create(
      survivorsDummy.mockSurvivors,
      (err) => {
        if (err) {
          console.error(err);
        }
        done();
      }
    );
  });

  afterEach((done) => {
    mongoose.connection.db.dropDatabase(() => {
      done();
    });
  });

  it('should list ALL survivors on /api/survivors GET', (done) => {
    chai.request(server)
      .get('/api/survivors')
      .end((err, res) => {
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
    Survivor.create(survivorsDummy.firstSurvivor,
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
    chai.request(server)
      .post('/api/survivors/')
      .send(survivorsDummy.secondSurvivor)
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
      // get survivors created in beforeEach
      .get('/api/survivors')
      .end((err, res) => {
        if (err) {
          console.error(err);
        }
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
              response.body.should.be.a('object');
              expect(response.body).to.have.deep.property(
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
            response.body.should.be.a('object');
            response.body.survivorOneUpdated._id.should.equal(arrayOfSurvivors[0].id);
            expect(response.body.survivorOneUpdated).to.have.deep.property(
              'inventory[0].name',
              res.body[1].inventory[0].name
            );
            expect(response.body.survivorOneUpdated).to.have.deep.property(
              'inventory[0].points',
              res.body[1].inventory[0].points
            );
            expect(response.body.survivorOneUpdated).to.have.deep.property(
              'inventory[1].name',
              res.body[1].inventory[1].name
            );
            expect(response.body.survivorOneUpdated).to.have.deep.property(
              'inventory[1].points',
              res.body[1].inventory[1].points
            );
            response.body.survivorTwoUpdated._id.should.equal(arrayOfSurvivors[1].id);
            expect(response.body.survivorTwoUpdated).to.have.deep.property(
              'inventory[0].name',
              res.body[0].inventory[0].name
            );
            expect(response.body.survivorTwoUpdated).to.have.deep.property(
              'inventory[0].points',
              res.body[0].inventory[0].points
            );
            done();
          });
      });
  });

  it('Get Percentage of infected/non-infected survivors /api/survivors/reports/survivors?infected={boolean} GET',
    (done) => {
      Survivor.create(survivorsDummy.thirdSurvivor,
        (err) => {
          if (err) {
            console.error(err);
          }
          chai.request(server)
            .get(`/api/survivors/reports/survivors?infected=${true}`)
            .end((error, res) => {
              res.should.have.status(200);
              res.should.be.json;
              res.body.should.be.a('object');
              res.body.result[0].percentage.toFixed(2).should.equal('33.33');
              chai.request(server)
                .get(`/api/survivors/reports/survivors?infected=${false}`)
                .end((error, response) => {
                  response.should.have.status(200);
                  response.should.be.json;
                  response.body.should.be.a('object');
                  response.body.result[0].percentage.toFixed(2).should.equal('66.67');
                  done();
                });
            });
        });
    });

  it('Get Percentage of each kind of resource by survivor /api/survivors/reports/survivors?resource={string} GET', (done) => {
    chai.request(server)
      // get survivors created in beforeEach
      .get(`/api/survivors/reports/survivors?resource=${'Food'}`)
      .end((error, response) => {
        response.should.have.status(200);
        response.body.should.be.a('object');
        response.body.result[0].average.should.equal(0.5);
        done();
      });
  });

  it('Get Points lost because of infected survivor /api/survivors/reports/survivors/pointslost', (done) => {
    Survivor.create(survivorsDummy.fourthSurvivor,
      (err) => {
        if (err) {
          console.error(err);
        }
        chai.request(server)
          // get survivors created in beforeEach
          .get('/api/survivors/reports/survivors/pointslost')
          .end((error, response) => {
            response.should.have.status(200);
            response.body.should.be.a('object');
            response.body.result[0].pointsLost.should.equal(8);
            done();
          });
      });
  });
});
