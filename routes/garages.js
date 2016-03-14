'use strict';
const Joi = require('joi');
const moment = require('moment');
const Service = require('../lib/service');
const Schema = require('../lib/models').Schema;

const config = { db: { host: process.env.DB_HOST || "192.168.99.100",
                       port: process.env.DB_PORT || "9042",
                       keyspace: "smartpark" },
                }

module.exports.routes = [
{
  method: 'GET',
  path: '/api/garage/',
  config: {
    plugins: {
      'hapi-io': {
        event: 'get-all-garages'
      }
    },
    description: 'Get All Garages',
    notes: 'Get All Garages',
    tags: ['api'],
    validate: {
      params: {
      pageSize: Joi.number().optional(),
      pageIndex: Joi.number().optional() }
    }
  },
  handler: function (request, reply) {
    let service = new Service(config);
    let params = {
      category: request.params.category,
      date: moment().utc().format('YYYY-MM-DD')
    }
    service.list(params, function(err, result) {
      if(err) {
        reply({
          statusCode: 500,
          message: err
        });
      } else {
        reply({
          statusCode: 200,
          message: 'successful operation',
          data: result.data
        });
      }
    });
  },
},
{
  method: 'GET',
  path: '/api/garage/{id?}',
  config: {
    plugins: {
      'hapi-io': {
        event: 'get-event'
      }
    },
    description: 'Get a Garage',
    notes: 'Get a Garage',
    tags: ['api'],
    validate: {
      params: {
        id: Joi.string().required().default(config.garage)
      }
    }
  },
  handler: function (request, reply) {
    let service = new Service(config);
    let params = {
      id: request.params.id
    }
    service.list(params, function(err, result) {
      if(err) {
        reply({
          statusCode: 500,
          message: err
        });
      } else {
        reply({
          statusCode: 200,
          message: 'successful operation',
          data: result.data
        });
      }
    });
  },
},
{
  method: 'POST',
  path: '/api/garage/',
  config: {
    description: 'Add a Garage',
    notes: 'Save a Garage',
    tags: ['api'],
    validate: {
      payload:  {
        description: Joi.string().default('New Garage'),
        contact: Joi.string().optional().regex(/^[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$/).allow(null).default('(000)000-0000'),
        online: Joi.boolean().default(false),
        image: Joi.string().allow(null).default(null),
        address: Joi.object().keys(Schema.Address),
        hours: Joi.object().keys(Schema.Hours).default(null),
        rates: Joi.array().optional().items(Joi.object().keys(Schema.Rate)).default(null),
        location: Joi.object().optional().keys(Schema.Location).default(null),
        capacity: Joi.object().keys(Schema.Capacity).default(null),
        revenue: Joi.array().optional().items(Joi.object().keys(Schema.Revenue)).default(null),
        devices: Joi.array().optional().items(Joi.object().keys(Schema.Device)).default(null)
      }
    },
    plugins: {
      'hapi-io': 'add-Garage'
    }
  },
  handler: function (request, reply) {
    let service = new Service(config);
    service.create(request.payload, function(err, result) {
      if(err) {
        reply({ statusCode: 500, message:err });
      }
      else {
        if(!result.success) {
          reply({
            statusCode: 500,
            message: result.message
          });
        } else {
          // Broadcast all connected client for new event added into system with newly addd event data only    
          var io = request.server.plugins['hapi-io'].io;
          io.emit('add-Garage',result.data);
          reply({
            statusCode: 200,
            message: 'successful operation',
            garage: result.data
          });
        }
      }
    });
  }
},
{
  method: 'DELETE',
  path: '/api/garage/{id?}',
  config: {
    description: 'Delete a Garage',
    notes: 'Remove the garage',
    tags: ['api'],
    validate: {
      params: {
        id: Joi.string().required()
      }
    },
    plugins: {
      'hapi-io': 'delete-Garage'
    }
  },
  handler: function (request, reply) {
    let service = new Service(config);
    let params = {
      id: request.params.id
    }
    service.delete(params, function(err, result) {
      if(err) {
        reply({ statusCode: 500, message:err });
      }
      else {
        reply({
          statusCode: 200,
          success: result.success,
          message: result.message,
          garage: result.data
        });
      }
    });
  }
},
{
  method: 'PUT',
  path: '/api/garage/{id?}',
  config: {
    description: 'Update a Garage',
    notes: 'Modify the garage',
    tags: ['api'],
    validate: {
      params: {
        id: Joi.string().required()
      },
      payload:  {
        description: Joi.string().default('New Garage'),
        contact: Joi.string().optional().regex(/^[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$/).allow(null).default('(000)000-0000'),
        online: Joi.boolean().default(false),
        image: Joi.string().allow(null).default(null),
        address: Joi.object().keys(Schema.Address),
        hours: Joi.object().keys(Schema.Hours).default(null),
        rates: Joi.array().optional().items(Joi.object().keys(Schema.Rate)).default(null),
        location: Joi.object().optional().keys(Schema.Location).default(null),
        capacity: Joi.object().keys(Schema.Capacity).default(null),
        revenue: Joi.array().optional().items(Joi.object().keys(Schema.Revenue)).default(null),
        devices: Joi.array().optional().items(Joi.object().keys(Schema.Device)).default(null)
      }
    },
    plugins: {
      'hapi-io': 'update-Garage'
    }
  },
  handler: function (request, reply) {
    let service = new Service(config);
    var data = {};
    data=request.payload;
    data.id=request.params.id;
    service.update(data, function(err, result) {
      if(err) {
        reply({ statusCode: 500, message:err });
      }
      else {
        reply({
          statusCode: 200,
          success: result.success,
          message: result.message,
          garage: result.data
        });
      }
    });
  }
}];