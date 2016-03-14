'use strict';

const Emitter = require('events').EventEmitter;
const util = require('util');
const path = require('path');
const Verror = require('verror');
const bunyan = require('bunyan');
const DbClient = require('./dbClient');
const Model = require('./models');


let log = bunyan.createLogger({
  name        : 'GarageService',
  level       : process.env.LOG_LEVEL || 'info',
  stream      : process.stdout,
  serializers : bunyan.stdSerializers
});



const Service = function(configuration) {
  Emitter.call(this);
  let self = this;
  let continueWith = null;
  let db = new DbClient();
  let config = configuration;
  let Table, closedb = null;

  if(!config) {
    config = {};
    config.db = {};
    config.db.host = process.env.DB_HOST || '192.168.99.100';
    config.db.port = process.env.DB_PORT || '9042';
    config.db.keyspace = process.env.DB_KEYSPACE || 'smartpark';
  }

  log.debug('Service Initialized', 'GarageService()');
  log.debug(config, 'GarageService.config');

  //////////////////////// INITIALIZATION DONE

  var countItems = function(params) {
    let query = 'SELECT COUNT(*) FROM Garage;';

     Table.execute_query(query, null, function(err, result) {
      if(err) return self.emit('send-error', err, 'Failed to Get Count');

      params.length = result.rows[0].count.toNumber();
      return self.emit('list-items', params);
     });
  };

  // CREATE
  var createItem = function(params) {
    let errorMsg = 'DB Create Failure';

    let dto = new Model.Garage(params);
    let valid = dto.isValid();
    if(valid !== null) return self.emit('send-error', valid, valid);

    let row = new Table(dto.toJson());
    row.save( (err) => {
      if(err) return self.emit('send-error', err, errorMsg);
      else return self.emit('send-data', dto);
    });
  };

  // READ
  var readItem = function(args) {
    let errorMsg = 'DB Read Failure';

    Table.findOne(args, function(err, result) {
      let dto = new Model.Garage(result);
      if(err) { return self.emit('send-error', err, errorMsg);}

      return self.emit('send-data', dto);
    });
  };

  // UPDATE
  var updateItem = function(args) {
    let errorMsg = 'DB Update Failure';

    let options = {if_exists: true};
    let changed = new Model.Garage(args);
    let valid = changed.isValid();
    if(valid !== null) return self.emit('send-error', valid, 'Invalid Object');

    delete changed['id'];
    log.debug('\nUPDATE ---1', args.id);
    log.debug('\nUPDATE ---2', changed);
    Table.update({id: args.id}, changed, options, function(err){
        if(err) { return self.emit('send-error', err, errorMsg); }

        changed.id = args.id;
        return self.emit('send-data', changed);
    });
  };

  // DELETE
  var deleteItem = function(params) {
    let errorMsg = 'DB Delete Failure';

    let filter = { id: params.id };
    Table.delete(filter, function(err){
        if(err) { return self.emit('send-error', err, errorMsg); }

        return self.emit('send-data', params);
    });
  };


  // Get List from the Database for all garage
  var listItems = function(params) {
    var errorMsg = 'DB List Failure';

    let pageResult = new Model.PageResult();

    if(params.pageIndex === undefined || params.pageIndex === null) {
      params.pageIndex = 0;
    }
    if(params.pageSize === undefined || params.pageSize === null) {
      params.pageSize = 50;
    }
    pageResult.currentPage = parseInt(params.pageIndex);
    pageResult.pageSize = parseInt(params.pageSize);

    pageResult.garages = [];

    let filter = {
      $limit: parseInt(params.pageSize),
      $skip: (params.pageSize) * parseInt(params.pageIndex) || 0
    }
    if(params.id) {filter.id = params.id;}

    //Math.ceil -- Always rounds up
    pageResult.pages = Math.ceil(pageResult.count / filter.$limit);


    Table.find(filter,{raw:true, allow_filtering: true}, function(err, rows){
      if(err) return self.emit('send-error', err, errorMsg);

      pageResult.count = rows.length;
      for(var row of rows) {
        pageResult.garages.push(new Model.Garage(row));
      }
      return self.emit('send-data', pageResult);
    });
  };

  // Create an Okay Result
  var sendData = function(data) {
    let result = new Model.Response();
    result.success = true;
    result.message = 'Success';
    result.data = data;
    log.debug(result, 'GarageService.sendData() received');

    if(continueWith) {
      continueWith(null, result);
    }
  };

  // Create a Bad Result
  var sendError = function(error, message) {
    let result = new Model.Response();
    result.success = false;
    result.message = message;
    log.error(error, 'GarageService.sendError');

    if(continueWith) {
      continueWith(null, result);
    }
  };


  var openConnection = function(eventHandler, args) {
    log.debug('DB Connection Open', 'GarageService.openConnection()');
    let errorMsg = 'DB Connection Failure';

    db.connect(config.db, function(err, db) {
      if(err || db.instance.Garage === undefined) {return self.emit('send-error', err, errorMsg);}

      closedb = db.close;
      Table = db.instance.Garage;

      Table.find({}, function(err, result) {
        if(err) { return self.emit('send-error', new Verror(err, 'DBQUERYERR'), errorMsg); }

        if(result.length === 0) {
          log.debug('Seeding the Database', 'GarageService.openConnection()');
          let data = require('./seed.json');
          let count = 0;

          for (var value of data) {
            let dto = new Model.Garage(value);
            let model = new Table(dto.toJson());
            model.save(function(err){
              if(err) return self.emit('send-error', err, errorMsg);
              else {
                count++;
                if(count === data.length) {
                  return self.emit(eventHandler, args);
                }
              }
            });
          }

        } else {
          return self.emit(eventHandler, args);
        }

      });
    });
  };

  /////////////////////////////////////////

  self.create = function(input, done) {
    log.debug({input: input}, 'GarageService.create()');
    continueWith = done;
    openConnection('create-item', input);
  };
  self.read = function(input, done) {
    log.debug({input: input}, 'GarageService.read()');
    continueWith = done;
    openConnection('read-item', input)
  }
  self.update = function(input, done) {
    log.debug({input: input}, 'GarageService.update()');
    continueWith = done;
    openConnection('update-item', input)
  }
  self.delete = function(input, done) {
    log.debug({input: input}, 'GarageService.delete()');
    continueWith = done;
    openConnection('delete-item', input);
  };
  self.list = function(input, done) {
    log.debug({input: input}, 'GarageService.list()');
    continueWith = done;
    openConnection('list-items', input);
  };
  self.close = function() {
    log.debug('DB Connection Close', 'GarageService.close()');
    if(closedb) { closedb(); }
  };

  // Event Wireup
  self.on('count-items', countItems);
  self.on('create-item', createItem);
  self.on('read-item', readItem);
  self.on('update-item', updateItem);
  self.on('delete-item', deleteItem);
  self.on('list-items', listItems);
  self.on('send-data', sendData);
  self.on('send-error', sendError);

  return self;
};

util.inherits(Service, Emitter);
module.exports = Service;