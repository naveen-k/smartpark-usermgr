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


describe('Model.Grid', () => {
	describe('Default Values', () => {
		let args = {  };
		let model = new Model.Grid(args);
		it('x is null', () => (model.x === null).should.be.true);
		it('y is null', () => (model.y === null).should.be.true);
		it('Validation should pass', () => should.not.exist(model.isValid()));
	});

	describe('Arguments', () => {
  	let args = {
      x: 12,
      y: 10
    };
    let model = new Model.Grid(args);
		it('should have an x', () => model.x.should.be.equal(args.x));
		it('should have an y', () => model.y.should.be.equal(args.y));
		it('Validation should pass', () => should.not.exist(model.isValid()));
	});
});


describe('Model.Hours', () => {
	describe('Default Values', () => {
		let args = {  };
		let model = new Model.Hours(args);
		it('Default value for from is set', () => model.from.should.be.equal('SUNDAY'));
		it('Default value for to is set', () => model.to.should.be.equal('SUNDAY'));
		it('Default value for open is set', () => model.open.should.be.equal('12:00AM'));
		it('Default value for closed is set', () => model.closed.should.be.equal('12:00AM'));
		it('Validation should pass', () => should.not.exist(model.isValid()));
	});

	describe('Arguments', () => {
  	let args = {
      from: 'FRIDAY',
      to: 'FRIDAY',
      open: '10:00AM',
      closed: '09:59PM'
    };
    let model = new Model.Hours(args);
		it('should have a from', () => model.from.should.be.equal(args.from));
		it('should have a to', () => model.to.should.be.equal(args.to));
		it('should have an open', () => model.open.should.be.equal(args.open));
		it('should have a closed', () => model.closed.should.be.equal(args.closed));
		it('Validation should pass', () => should.not.exist(model.isValid()));
	});
});


describe('Model.Location', () => {
	describe('Default Values', () => {
		let args = {  };
		let model = new Model.Location(args);
		it('Default value for longtitude', () => model.longitude.should.be.equal(0));
		it('Default value for latitude', () => model.latitude.should.be.equal(0));
		it('Validation should pass', () => should.not.exist(model.isValid()));
	});

	describe('Arguments', () => {
  	let args = {
      latitude: 42.659946,
      longitude: -71.31698
    };
    let model = new Model.Location(args);
		it('should have a longitude', () => model.longitude.should.be.equal(args.longitude));
		it('should have a latitude', () => model.latitude.should.be.equal(args.latitude));
		it('Validation should pass', () => should.not.exist(model.isValid()));
	});
});


describe('Model.Capacity', () => {
	describe('Default Values', () => {
		let args = {  };
		let model = new Model.Capacity(args);
		it('Default value for total', () => model.total.should.be.equal(0));
		it('Default value for reserved', () => model.reserved.should.be.equal(0));
		it('Default value for occupied', () => model.occupied.should.be.equal(0));
		it('Validation should pass', () => should.not.exist(model.isValid()));
	});

	describe('Arguments', () => {
  	let args = {
      total: 100,
      reserved: 10,
      occupied: 60
    };
    let model = new Model.Capacity(args);
		it('should have a total', () => model.total.should.be.equal(args.total));
		it('should have a reserved', () => model.reserved.should.be.equal(args.reserved));
		it('should have an occupied', () => model.occupied.should.be.equal(args.occupied));
		it('Validation should pass', () => should.not.exist(model.isValid()));
	});
});


describe('Model.RateList', () => {
	describe('Default Values', () => {
		let args = {  };
		let model = new Model.RateList();
		it('should have all default items', () => model.should.be.instanceof(Array).with.length(3));
		it('Validation should pass', () => {
			let validator = new Model.ListValidator({rateList: model});
			should.not.exist(validator.isValid());
		});
	});

	describe('Arguments', () => {
		let model, modified;

		before( () => {
			model = new Model.RateList();
			model[0].rate = 100;
		});

		it('should allow a rate change', () => {
			modified = new Model.RateList(model);
			modified[0].rate.should.be.equal(model[0].rate);
		});
		it('Validation should pass', () => {
			let validator = new Model.ListValidator({rateList: modified});
			should.not.exist(validator.isValid());
		});
	});
});


describe('Model.RevenueList', () => {
	describe('Default Values', () => {
		let args = {  };
		let model = new Model.RevenueList();
		it('should have an empty list', () => model.should.be.empty);
		it('Validation should pass', () => {
			let validator = new Model.ListValidator({revenueList: model});
			should.not.exist(validator.isValid());
		});
	});

	describe('Arguments', () => {
		let model, modified;
		let list = [];
  	list.push({date: new Date(), amount: 100});
  	list.push({date: new Date(), amount: 9});

		before( () => model = new Model.RevenueList(list));

		it('should have all items', () => model.should.be.instanceof(Array).with.length(2));
		it('has a date', () => model[0].date.should.be.equal(list[0].date));
		it('has an amount', () => model[0].amount.should.be.equal(list[0].amount));
		it('Validation should pass', () => {
			let validator = new Model.ListValidator({revenueList: model});
			should.not.exist(validator.isValid());
		});
	});
});


describe('Model.DeviceList', () => {
	describe('Default Values', () => {
		let args = {  };
		let model = new Model.DeviceList();
		it('should have an empty list', () => model.should.be.empty);
		it('Validation should pass', () => {
			let validator = new Model.ListValidator({deviceList: model});
			should.not.exist(validator.isValid());
		});
	});

	describe('Arguments', () => {
		let model, modified;
		let list = [];
		list.push({stream: "URL", image: "URL"});
  	list.push({stream: "URL", image: "URL"});

		before( () => model = new Model.DeviceList(list));

		it('should have all items', () => model.should.be.instanceof(Array).with.length(2));
		it('has an id', () => model[0].id.should.be.string);
		it('has a type', () => model[0].type.should.be.equal('PROXIMITY'));
		it('is not online by default', () => model[0].online.should.be.false);
		it('has a stream', () => model[0].stream.should.be.equal(list[0].stream));
		it('has an image', () => model[0].image.should.be.equal(list[0].image));
		it('Validation should pass', () => {
			let validator = new Model.ListValidator({deviceList: model});
			should.not.exist(validator.isValid());
		});
	});
});


describe('Model.Garage', () => {
  describe('Default Values', () => {
  	let args = {
  		description: "Unit Tested Garage",
  		address: {
  			street: "100 Unit Test",
  			city: "Unit Testing",
  			state: "UT",
  			zip: "00000"
  		}
  	 };
    let model = new Model.Garage(args);

    it('Guid id is auto set', () =>  should.exist(model.id) );
    it('is not online by default', () => model.online.should.be.false);
    it('Validation should pass', () => should.not.exist(model.isValid()));
  });

  describe('Arguments', () => {
  	let data = require('./data.json');
    let model = new Model.Garage(data);
    it('has a description', () => model.description.should.equal(data.description));
    it('has a contact', () => model.contact.should.equal(data.contact));
    it('is online', () => model.online.should.be.true);
    it('has an image', () => model.image.should.equal(data.image));
    it('has an address object', () => model.address.should.be.instanceof(Object));
    it('has hours object', () => model.hours.should.be.instanceof(Object));
    it('has a location', () => model.location.should.be.instanceof(Object));
    it('has a rates list', () => model.rates.should.be.instanceof(Array).with.length(3));
    it('has a revenue list', () => model.revenue.should.be.instanceof(Array).with.length(1));
    it('has a device list', () => model.devices.should.be.instanceof(Array).with.length(5));
    it('Validation should pass', () => should.not.exist(model.isValid()));
  });
});