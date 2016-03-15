'use strict';
var util = require('util');
var uuid = require('node-uuid');
var moment = require('moment');
var Joi = require('joi');

var Model = function(args) {
  var self = this;

  self.PageResult = class {
    constructor() {
      this.pages = 0;
      this.currentPage = 0;
      this.count = 0;
    }
  }

  self.Response = class {
    constructor(args) {
      if(!args) { args = {} };
      this.success = false || args.success;
      this.message = null || args.message;
      this.data = null;
    }
  }

/////////////////////////////////////////
//                SCHEMA               //
/////////////////////////////////////////

  const _addressSchema = {
    street : Joi.string().required(),
    city : Joi.string().required(),
    state : Joi.string().required(),
    zip : Joi.string().required()
  };

  let _carSchema = {
    make: Joi.string(),
    model: Joi.string(),
    licence: Joi.string()
  };

  let _favoriteGarageSchema = {
    id: Joi.string()
  };

  let _userSchema = {
    id: Joi.string().guid(),
    first_name: Joi.string(),
    last_name: Joi.string(),
    contact: Joi.string().regex(/^[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$/).allow(null),
    email: Joi.string(),
    join_date: Joi.date().format('YYYY-MM-DD').raw(),
    avatar: Joi.string().allow(null),
    address: Joi.object(),
    cars: Joi.array(),
    favorite_garages: Joi.array()
  };

  self.Schema = {
    Address: _addressSchema,
    FavoriteGarage: _favoriteGarageSchema,
    Car: _carSchema,
    User: _userSchema
  }

/////////////////////////////////////////
//                DTO                  //
/////////////////////////////////////////

  self.Address = class Address {
    constructor(args) {
      if(!args) { args = {} };
      this.street = args.street || null;
      this.city = args.city || null;
      this.state = args.state || null;
      this.zip = args.zip || null;
    }

    isValid() {
      return Joi.validate(this, Joi.object().keys(self.Schema.Address)).error;
    }

  }

  self.Cars = class Cars {
    constructor(args) {
      if(!args) { args = {} };
      this.make = args.make || null;
      this.model = args.model || null;
      this.licence = args.licence || null;
    }

    isValid() {
      return Joi.validate(this, Joi.object().keys(self.Schema.Cars)).error;
    }
  }

  self.FavoriteGarage = class FavoriteGarage {
    constructor(args) {
      if(!args) { args = {} };
      this.id = args.is || null;
    }

    isValid() {
      return Joi.validate(this, Joi.object().keys(self.Schema.FavoriteGarage)).error;
    }
  }

/////////////////////////////////////////
//              ARRAYS                 //
/////////////////////////////////////////

  self.CarList = function(args) {
    if(!args) { args = [] };

    let list = new Array();
    if(args.length === 0) {
      list.push({make: "Audi", model: "A6", licence: "TX-121"});
      list.push({make: "BMW", model: "Q6", licence: "TX-122"});
      list.push({make: "Honda", model: "Civic", licence: "TX-123"});
      return list;
    }
    for (var value of args) {
      list.push(value);
    }
    return list;
  };

  self.FavoriteGarageList = function(args) {
    if(!args) { args = [] };

    let list = new Array();
    if(args.length === 0) {
      return list;
    }
    for (var value of args) {
      let item = {};
      item.id = value.id || null;
      list.push(item);
    }
    return list;
  }

  self.ListValidator = class ListValidator {
    constructor(args) {
      if(!args) { args = {} };

      if(args.CarList) {
        this.list = args.rateList;
        this._schema = self.Schema.Rate;
      }
      else if(args.FavoriteGarageList) {
        this.list = args.revenueList;
        this._schema = self.Schema.Revenue;
      }
     
    }

    isValid() {
      return Joi.validate(this.list, Joi.array().items(Joi.object().keys(this._schema))).error;
    }
  }


/////////////////////////////////////////
//              USER                 //
/////////////////////////////////////////


  self.User = class User {
    constructor(args) {
      if(!args) { args = {} };
      if(!args.address) { args.address = {} };
      if(!args.cars) { args.cars = [] };
      if(!args.favorite_garages) { args.favorite_garages = [] };
      
      this.id = args.id || uuid.v4();
      this.first_name = args.first_name;
      this.last_name = args.last_name;
      this.contact = args.contact || null;
      this.email = args.email || null;
      this.join_date = args.join_date || moment().utc().format('YYYY-MM-DD');
      this.avatar = args.avatar || null;
      this.address = new self.Address(args.address);
      this.cars = new self.CarList(args.cars);
      this.favorite_garages = new self.FavoriteGarageList(args.favorite_garages);
    }
    isValid() {
      let errors = new Array();
      errors.push(Joi.validate(this, Joi.object().keys(self.Schema.User)).error);
      errors.push(Joi.validate(this.address, Joi.object().keys(self.Schema.Address)).error);
      errors.push(Joi.validate(this.cars, Joi.array().items(Joi.object().keys(self.Schema.Car))).error);
      errors.push(Joi.validate(this.favorite_garages, Joi.array().items(Joi.object().keys(self.Schema.FavoriteGarage))).error);
      errors = errors.filter(err => err !== null);
      if(errors.length > 0) { return errors; }
      else { return null; }
    }
    toJson() {
      let data = JSON.stringify(this);
      return JSON.parse(data);
    }
  }

  return self;
}

module.exports = new Model();