/* jshint -W024, -W101, -W079, -W098 -W031 */
/* jshint expr:true */
'use strict';

const should = require('chai').should();
const uuid = require('node-uuid');
const Service = require('../lib/service');
const Client = require('../lib/dbClient');
const config = require('./config.json');
const User = require('../lib/models').User;

describe('Service.User', () => {

  let db = new Client();
  let Table, service = null;

   before(done => {
    service = new Service(config);
    db.connect(config.db, function(err, db) {
      if(err) {console.log(err)};
      db.instance.User.execute_query('truncate test.User;', null, function(err, result) {
        Table = db.instance.User;
        done();
      })
    });
   });

	describe('List Features', () => {
		let item = null;

    it('Retrieves a JSON Object with Users as an Array', (done) => {
      service.list({}, (err, result) => {
        (err === null).should.be.true;
        result.success.should.be.true;
        result.data.Users.should.be.instanceof(Array);
        result.data.Users.should.have.length.above(0);
        item = result.data.Users[0];
        done();
      });
    });

    describe('List Property Values', () => {
      it('Defines a id', () => item.should.have.property('id'));
      it('Defines a first_name', () => item.should.have.property('first_name'));
      it('Defines a last_name', () => item.should.have.property('last_name'));
      it('Defines a contact', () => item.should.have.property('contact'));
      it('Defines a email', () => item.should.have.property('email'));
      it('Defines an avatar', () => item.should.have.property('avatar'));
      it('Defines an address', () => item.should.have.property('address'));
      it('Defines a join_date', () => item.should.have.property('join_date'));
      it('Defines cars', () => item.should.have.property('cars'));
      it('Defines favorite_garage', () => item.should.have.property('favorite_garages'));
    });
	});

  describe('CRUD Features', () => {

    describe('Create Item', () => {
      let item = null;
      var dto = {
        first_name: "TEST FISTNAME",
        contact: "(781) 466-4308",
        email: "test.clernon@verizon.com",
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
      it('Defines a first_name', () => item.first_name.should.be.equal(dto.first_name));
      it('Defines an address', () => {
        item.address.street.should.be.equal(dto.address.street);
        item.address.city.should.be.equal(dto.address.city);
        item.address.state.should.be.equal(dto.address.state);
        item.address.zip.should.be.equal(dto.address.zip);
      });
      it('Defines cars', () => {
        item.cars.should.be.instanceof(Array);
      });

      after(function(done) {
        Table.delete({id: item.id}, function(err){
          done();
        });
      });
    });

    describe('Read User', function(done) {
      let user = {};

      before(function(done) {
        let query = 'select id from user limit 1;';
        Table.execute_query(query, null, function(err, result) {
          user.id = result.rows[0].id;
          done();
        });
      });

      it('Reads a user by Id', function(done) {
        service.read(user, function(err, result) {
          result.success.should.be.true;
          result.data.id.should.be.equal(user.id);
          done();
        });
      });
    });

    describe('Update User', function(done) {
      let user = new User({
        first_name: "TEST NAME",
        last_name: "TEST LAST NAME",
        contact: '(781) 466-4308',
        email: 'test@test.com',
        avatar: null,
        address: { street: "TEST STREET", city: "TEST CITY", state: "TD",zip: "00000" },
        hours: { from: 'SUNDAY', to: 'SUNDAY', open: '12:00AM', closed: '12:00AM' },
        location: { latitude: 0, longitude: 0 },
        capacity: { total: 0, reserved: 0, occupied: 0 },
        cars: [
          { make: "Honda", model: 'civi', licence: "tx201" },
          { make: "Hundai", model: 'sonata', licence: "tx222" }
        ],
        favorite_garage: []
      });

      before(function(done) {
        let row = new Table(JSON.parse(JSON.stringify(user)));
        row.save(function(err) {
          user.id = row.id;
          done();
        });
      });

      it('Updates a user by Id', function(done) {
        user.first_name = "Changed name";
        service.update(user, function(err, result) {
          result.success.should.be.true;
          result.data.id.should.be.equal(user.id);
          result.data.first_name.should.be.equal(user.first_name);
          done();
        });
      });

      after(function(done) {
        Table.delete({id: user.id}, function(err){
          done();
        });
      });
    });

    describe('Delete User', function(done) {
      
       let user = new User({
        first_name: "TEST NAME",
        last_name: "TEST LAST NAME",
        contact: '(781) 466-4308',
        email: 'test@test.com',
        avatar: null,
        address: { street: "TEST STREET", city: "TEST CITY", state: "TD",zip: "00000" },
        hours: { from: 'SUNDAY', to: 'SUNDAY', open: '12:00AM', closed: '12:00AM' },
        location: { latitude: 0, longitude: 0 },
        capacity: { total: 0, reserved: 0, occupied: 0 },
        cars: [
          { make: "Honda", model: 'civi', licence: "tx201" },
          { make: "Hundai", model: 'sonata', licence: "tx222" }
        ],
        favorite_garage: []
      });

      before(function(done) {
        let row = new Table(JSON.parse(JSON.stringify(user)));
        row.save(function(err) {
          user.id = row.id;
          done();
        });
      });

      it('Deletes a user by Id', function(done) {
        service.delete(user, function(err, result) {
          result.success.should.be.true;
          done();
        });
      });

      after(function(done) {
        Table.delete({id: user.id}, function(err){
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