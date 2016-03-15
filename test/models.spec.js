/* jshint -W024, -W101, -W079, -W098 -W031 */
/* jshint expr:true */
'use strict';

const should = require('chai').should();
const uuid = require('node-uuid');
const Model = require('../lib/models');

describe('Model.Address', () => {
	describe('Default Values', () => {
		let args = {  };
		let model = new Model.Address(args);
		it('street is Empty', () => (model.street === null).should.be.true);
		it('city is Empty', () => (model.city === null).should.be.true);
		it('state is Empty', () => (model.state === null).should.be.true);
		it('zip is Empty', () => (model.zip === null).should.be.true);
		it('Validation should not pass', () => should.exist(model.isValid()));
	});

	describe('Arguments', () => {
  	let args = {
      street: 'street',
      city: 'city',
      state: 'ST',
      zip: "12345"
    };
    let model = new Model.Address(args);
		it('should have a street', () => model.street.should.be.equal(args.street));
		it('should have a city', () => model.city.should.be.equal(args.city));
		it('should have a state', () => model.state.should.be.equal(args.state));
		it('should have a zipcode', () => model.zip.should.be.equal(args.zip));
		it('Validation should pass', () => should.not.exist(model.isValid()));
	});
});


describe('Model.CarList', () => {
	describe('Default Values', () => {
		let args = {  };
		let model = new Model.CarList();
		it('should have all default items', () => model.should.be.instanceof(Array).with.length(3));
		it('Validation should pass', () => {
			let validator = new Model.ListValidator({carList: model});
			should.not.exist(validator.isValid());
		});
	});

	describe('Arguments', () => {
		let model, modified;

		before( () => {
			model = new Model.CarList();
			model[0].make = 'Audi';
		});

		it('should allow a car change', () => {
			modified = new Model.CarList(model);
			modified[0].make.should.be.equal(model[0].make);
		});
		it('Validation should pass', () => {
			let validator = new Model.ListValidator({carList: modified});
			should.not.exist(validator.isValid());
		});
	});
});


describe('Model.FavoriteGarage', () => {
	describe('Default Values', () => {
		let args = {  };
		let model = new Model.FavoriteGarageList();
		it('should have an empty list', () => model.should.be.empty);
		it('Validation should pass', () => {
			let validator = new Model.ListValidator({favoriteGarageList: model});
			should.not.exist(validator.isValid());
		});
	});

	describe('Arguments', () => {
		let model, modified;
		let list = [];
  	    list.push({id: "garage-0001"});
  	    list.push({id: "garage-0002"});

		before( () => model = new Model.FavoriteGarageList(list));

		it('should have all items', () => model.should.be.instanceof(Array).with.length(2));
		it('has a id', () => model[0].id.should.be.equal(list[0].id));
		
		it('Validation should pass', () => {
			let validator = new Model.ListValidator({revenueList: model});
			should.not.exist(validator.isValid());
		});
	});
});


describe('Model.User', () => {
  describe('Default Values', () => {
  	let args = {
        first_name: "TEST NAME",
        last_name: "TEST LAST NAME",
        contact: '(781) 466-4308',
        email: 'test@test.com',
        avatar: null,
        address: { street: "TEST STREET", city: "TEST CITY", state: "TD",zip: "00000" },
        cars: [
          { make: "Honda", model: 'civi', licence: "tx201" },
          { make: "Hundai", model: 'sonata', licence: "tx222" }
        ],
        favorite_garages: [
        	{id: "aa5f06c8-3400-4416-bd57-d3696ff2f9e7"},
      		{id: "aa5f06c8-3400-4416-bd57-d3696ff2f9e7"}
      	]
     };
    let model = new Model.User(args);

    it('Guid id is auto set', () =>  should.exist(model.id) );
    it('Validation should pass', () => should.not.exist(model.isValid()));
  });

  describe('Arguments', () => {
  	let data = require('./data.json');
    let model = new Model.User(data);
    console.log(model)
    it('has a firstName', () => model.first_name.should.equal(data.first_name));
    it('has a lastName', () => model.last_name.should.equal(data.last_name));
    it('has a contact', () => model.contact.should.equal(data.contact));
    it('has a email', () => model.email.should.be.equal(data.email));
    it('has an avatar', () => model.avatar.should.equal(data.avatar));
    it('has an address object', () => model.address.should.be.instanceof(Object));
    it('has a car list', () => model.cars.should.be.instanceof(Array).with.length(1));
    it('has a favoriteGarage list', () => model.favorite_garages.should.be.instanceof(Array).with.length(2));
    it('Validation should pass', () => should.not.exist(model.isValid()));
  });
});