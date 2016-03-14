/* jshint -W024, -W101, -W079, -W098 -W031 */
/* jshint expr:true */
'use strict';

const should = require('chai').should();
const uuid = require('node-uuid');
const Service = require('../lib/service');
const Client = require('../lib/dbClient');
const config = require('./config.json');
const Garage = require('../lib/models').Garage;

describe('Service.Garage', () => {

  let db = new Client();
  let Table, service = null;

   before(done => {
    service = new Service(config);
    db.connect(config.db, function(err, db) {
      if(err) {console.log(err)};
      db.instance.Garage.execute_query('truncate test.Garage;', null, function(err, result) {
        Table = db.instance.Garage;
        done();
      })
    });
   });

	describe('List Features', () => {
		let item = null;

    it('Retrieves a JSON Object with Garages as an Array', (done) => {
      service.list({}, (err, result) => {
        (err === null).should.be.true;
        result.success.should.be.true;
        result.data.garages.should.be.instanceof(Array);
        result.data.garages.should.have.length.above(0);
        item = result.data.garages[0];
        done();
      });
    });

    describe('List Property Values', () => {
      it('Defines a id', () => item.should.have.property('id'));
      it('Defines a description', () => item.should.have.property('description'));
      it('Defines a contact', () => item.should.have.property('contact'));
      it('Defines an online state', () => item.should.have.property('online'));
      it('Defines an image', () => item.should.have.property('image'));
      it('Defines an address', () => item.should.have.property('address'));
      it('Defines hours', () => item.should.have.property('hours'));
      it('Defines a location', () => item.should.have.property('location'));
      it('Defines a capacity', () => item.should.have.property('capacity'));
      it('Defines rates', () => item.should.have.property('rates'));
      it('Defines revenue', () => item.should.have.property('revenue'));
      it('Defines devices', () => item.should.have.property('devices'));
    });
	});

  describe('CRUD Features', () => {

    describe('Create Item', () => {
      let item = null;
      var dto = {
        description: "TEST DESCRIPTION",
        address: {
          street: "TEST STREET",
          city: "TEST CITY",
          state: "TD",
          zip: "00000"
        }
      };

      it('Creates an Event and returns success with an event', function(done){
        service.create(dto, function(err, result) {
          result.should.not.be.equal(null);
          result.success.should.be.true;
          item = result.data;
          done();
        });
      });
      it('Defines an id', () => (item.id === null).should.be.false);
      it('Defines a description', () => item.description.should.be.equal(dto.description));
      it('Defines an address', () => {
        item.address.street.should.be.equal(dto.address.street);
        item.address.city.should.be.equal(dto.address.city);
        item.address.state.should.be.equal(dto.address.state);
        item.address.zip.should.be.equal(dto.address.zip);
      });
      it('Defines rates', () => {
        item.rates.should.be.instanceof(Array);
      });

      after(function(done) {
        Table.delete({id: item.id}, function(err){
          done();
        });
      });
    });

    describe('Read Garage', function(done) {
      let garage = {};

      before(function(done) {
        let query = 'select id from garage limit 1;';
        Table.execute_query(query, null, function(err, result) {
          garage.id = result.rows[0].id;
          done();
        });
      });

      it('Reads a garage by Id', function(done) {
        service.read(garage, function(err, result) {
          result.success.should.be.true;
          result.data.id.should.be.equal(garage.id);
          done();
        });
      });
    });

    describe('Update Garage', function(done) {
      let garage = new Garage({
        description: "TEST DESCRIPTION",
        contact: null,
        online: false,
        image: null,
        address: { street: "TEST STREET", city: "TEST CITY", state: "TD",zip: "00000" },
        hours: { from: 'SUNDAY', to: 'SUNDAY', open: '12:00AM', closed: '12:00AM' },
        location: { latitude: 0, longitude: 0 },
        capacity: { total: 0, reserved: 0, occupied: 0 },
        rates: [
          { type: "HOUR", rate: 10, currency: "$" },
          { type: "HALF", rate: 20, currency: "$" },
          { type: "FULL", rate: 25, currency: "$" }
        ],
        revenue: [],
        devices: []
      });

      before(function(done) {
        let row = new Table(JSON.parse(JSON.stringify(garage)));
        row.save(function(err) {
          garage.id = row.id;
          done();
        });
      });

      it('Updates a garage by Id', function(done) {
        garage.description = "Changed Description";
        service.update(garage, function(err, result) {
          result.success.should.be.true;
          result.data.id.should.be.equal(garage.id);
          result.data.description.should.be.equal(garage.description);
          done();
        });
      });

      after(function(done) {
        Table.delete({id: garage.id}, function(err){
          done();
        });
      });
    });

    describe('Delete Garage', function(done) {
      let garage = new Garage({
        description: "TEST DESCRIPTION",
        address: {
          street: "TEST STREET",
          city: "TEST CITY",
          state: "TD",
          zip: "00000"
        }
      });

      before(function(done) {
        let row = new Table(JSON.parse(JSON.stringify(garage)));
        row.save(function(err) {
          garage.id = row.id;
          done();
        });
      });

      it('Deletes a garage by Id', function(done) {
        service.delete(garage, function(err, result) {
          result.success.should.be.true;
          done();
        });
      });

      after(function(done) {
        Table.delete({id: garage.id}, function(err){
          done();
        });
      });
    });
  });

  after(done => {
    service.close();
    done();
  });
});