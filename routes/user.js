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
  path: '/api/user/',
  config: {
    plugins: {
      'hapi-io': {
        event: 'get-all-users'
      }
    },
    description: 'Get All users',
    notes: 'Get All users',
    tags: ['api'],
    validate: {
      params: {
      pageSize: Joi.number().optional(),
      pageIndex: Joi.number().optional() }
    }
  },
  handler: function (request, reply) {
    let service = new Service(config);
    let params = {};
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
  }
},{
  method: 'POST',
  path: '/api/user/',
  config: {
    description: 'Add a user',
    notes: 'Save a User',
    tags: ['api'],
    validate: {
      payload:  {

        id: Joi.string().guid(),
        first_name: Joi.string(),
        last_name: Joi.string(),
        contact: Joi.string().regex(/^[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$/).allow(null),
        email: Joi.string(),
        join_date: Joi.date().format('YYYY-MM-DD').raw(),
        avatar: Joi.string().default(null),
        address: Joi.object().keys(Schema.Address),
        cars: Joi.array().optional().items(Joi.object().keys(Schema.Car)).default(null),
        favorite_garages: Joi.array().optional().items(Joi.object().keys(Schema.FavoriteGarage)).default(null)
      }
    },
    plugins: {
      'hapi-io': 'add-User'
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
          io.emit('add-User',result.data);
          reply({
            statusCode: 200,
            message: 'successful operation',
            user: result.data
          });
        }
      }
    });
  }
}
];