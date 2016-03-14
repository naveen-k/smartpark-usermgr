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
      this.events = [];
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

  let _gridSchema = {
    x : Joi.number().required().allow(null),
    y : Joi.number().required().allow(null)
  };

  let _hoursSchema = {
    from : Joi.string().required().valid('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'),
    to : Joi.string().required().valid('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'),
    open : Joi.string().required(),
    closed : Joi.string().required()
  };


  let _locationSchema = {
    latitude : Joi.number(),
    longitude : Joi.number()
  };

  let _capacitySchema = {
    total : Joi.number().allow(0),
    reserved : Joi.number().allow(0),
    occupied : Joi.number().allow(0)
  };

  let _rateSchema = {
    type: Joi.string().valid('HOUR','HALF','FULL'),
    rate: Joi.number(),
    currency: Joi.string().valid('$')
  };

  let _revenueSchema = {
    date: Joi.date().format('YYYY-MM-DD').raw(),
    amount: Joi.number()
  };

  let _deviceSchema = {
    id: Joi.string(),
    type: Joi.string().valid('PROXIMITY', 'CAMERA','LIGHT','BIOHAZARD'),
    online : Joi.boolean(),
    image : Joi.string(),
    stream : Joi.string()
  };

  let _garageSchema = {
    id: Joi.string().guid(),
    description: Joi.string(),
    contact: Joi.string().regex(/^[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$/).allow(null),
    online: Joi.boolean(),
    image: Joi.string().allow(null),
    address: Joi.object(),
    hours: Joi.object(),
    rates: Joi.array(),
    location: Joi.object(),
    capacity: Joi.object(),
    revenue: Joi.array(),
    devices: Joi.array()
  };

  self.Schema = {
    Address: _addressSchema,
    Grid: _gridSchema,
    Hours: _hoursSchema,
    Location: _locationSchema,
    Capacity: _capacitySchema,
    Rate: _rateSchema,
    Revenue: _revenueSchema,
    Device: _deviceSchema,
    Garage: _garageSchema
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

  self.Grid = class Grid {
    constructor(args) {
      if(!args) { args = {} };
      this.x = args.x || null;
      this.y = args.y || null;
    }

    isValid() {
      return Joi.validate(this, Joi.object().keys(self.Schema.Grid)).error;
    }
  }

  self.Hours = class Hours {
    constructor(args) {
      if(!args) { args = {} };
      this.from = args.from || "SUNDAY";
      this.to = args.to || "SUNDAY";
      this.open = args.open || "12:00AM";
      this.closed = args.closed || "12:00AM";
    }

    isValid() {
      return Joi.validate(this, Joi.object().keys(self.Schema.Hours)).error;
    }
  }

  self.Location = class Location {
    constructor(args) {
      if(!args) { args = {} };
      this.latitude = args.latitude || 0;
      this.longitude = args.longitude || 0;
    }

    isValid() {
      return Joi.validate(this, Joi.object().keys(self.Schema.Location)).error;
    }
  }

  self.Capacity = class Capacity {
    constructor(args) {
      if(!args) { args = {} };
      this.total = args.total || 0;
      this.reserved = args.reserved || 0;
      this.occupied = args.occupied || 0;
    }

    isValid() {
      return Joi.validate(this, Joi.object().keys(self.Schema.Capacity)).error;
    }
  }


/////////////////////////////////////////
//              ARRAYS                 //
/////////////////////////////////////////

  self.RateList = function(args) {
    if(!args) { args = [] };

    let list = new Array();
    if(args.length === 0) {
      list.push({type: "HOUR", rate: 10, currency: "$"});
      list.push({type: "HALF", rate: 20, currency: "$"});
      list.push({type: "FULL", rate: 25, currency: "$"});
      return list;
    }
    for (var value of args) {
      list.push(value);
    }
    return list;
  };

  self.RevenueList = function(args) {
    if(!args) { args = [] };

    let list = new Array();
    for (var value of args) {
      let item = {};
      item.date = value.date || null;
      item.amount = value.amount || 0;
      list.push(item);
    }
    return list;
  }

  self.DeviceList = function(args) {
    if(!args) { args = [] };

    let list = new Array();
    if(args.length === 0) {
      return list;
    }
    for (var value of args) {
      let item = {};
      item.id = value.id || uuid.v4();
      item.type = value.type || 'PROXIMITY';
      item.online = value.online || false;
      item.image = value.image || null;
      item.stream = value.stream || null;
      list.push(item);
    }
    return list;
  }

  self.ListValidator = class ListValidator {
    constructor(args) {
      if(!args) { args = {} };

      if(args.rateList) {
        this.list = args.rateList;
        this._schema = self.Schema.Rate;
      }
      else if(args.revenueList) {
        this.list = args.revenueList;
        this._schema = self.Schema.Revenue;
      }
      else if(args.deviceList) {
        this.list = args.deviceList;
        this._schema = self.Schema.Device;
      }
    }

    isValid() {
      return Joi.validate(this.list, Joi.array().items(Joi.object().keys(this._schema))).error;
    }
  }


/////////////////////////////////////////
//              GARAGE                 //
/////////////////////////////////////////


  self.Garage = class Garage {
    constructor(args) {
      if(!args) { args = {} };
      if(!args.address) { args.address = {} };
      if(!args.hours) { args.hours = {} };
      if(!args.location) { args.location = {} };
      if(!args.capacity) { args.capacity = {} };
      if(!args.revenue) { args.revenue = [] };
      if(!args.rates) { args.rates = [] };
      if(!args.levels) { args.levels = [] };
      if(!args.devices) { args.devices = [] };
      if(!args.levels) { args.levels = [] };

      this.id = args.id || uuid.v4();
      this.description = args.description;
      this.contact = args.contact || null;
      this.online = args.online || false;
      this.image = args.image || null;
      this.address = new self.Address(args.address);
      this.hours = new self.Hours(args.hours);
      this.location = new self.Location(args.location);
      this.capacity = new self.Capacity(args.capacity);
      this.rates = new self.RateList(args.rates);
      this.revenue = new self.RevenueList(args.revenue);
      this.devices = new self.DeviceList(args.devices);
    }
    isValid() {
      let errors = new Array();
      errors.push(Joi.validate(this, Joi.object().keys(self.Schema.Garage)).error);
      errors.push(Joi.validate(this.address, Joi.object().keys(self.Schema.Address)).error);
      errors.push(Joi.validate(this.hours, Joi.object().keys(self.Schema.Hours)).error);
      errors.push(Joi.validate(this.location, Joi.object().keys(self.Schema.Location)).error);
      errors.push(Joi.validate(this.capacity, Joi.object().keys(self.Schema.Capacity)).error);
      errors.push(Joi.validate(this.rates, Joi.array().items(Joi.object().keys(self.Schema.Rate))).error);
      errors.push(Joi.validate(this.revenue, Joi.array().items(Joi.object().keys(self.Schema.Revenue))).error);
      errors.push(Joi.validate(this.devices, Joi.array().items(Joi.object().keys(self.Schema.Device))).error);

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