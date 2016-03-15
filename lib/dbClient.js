'use strict';

const Emitter = require('events').EventEmitter;
const util = require('util');
const Verror = require('verror');
const bunyan = require('bunyan');
const Cassandra = require('irvui-express-cassandra');

const VersionModel = {
  "fields":{
      "change":{"type":"int"},
      "madeAt":{"type":"timestamp", "default":{"$db_function":"toTimestamp(now())"} }
  },
  "key":["change"]
};

const user_car = util.format(
  "CREATE TYPE IF NOT EXISTS %s (%s);",
  "user_car",
  "make text, model text, licence text"
);
const user_favorite_garage = util.format(
  "CREATE TYPE IF NOT EXISTS %s (%s);",
  "user_favorite_garage",
  "id text"
);

var log = bunyan.createLogger({
  name        : 'Database',
  level       : process.env.LOG_LEVEL || 'info',
  stream      : process.stdout,
  serializers : bunyan.stdSerializers
});


var Database = function() {
  Emitter.call(this);
  var self = this;
  var continueWith = null;
  let config;

  log.debug('Database Initialized', 'Database()');

  //////////////////////// INITIALIZATION DONE

  var get_options = function(config) {
    return {
      clientOptions: {
        contactPoints: [config.host],
        protocolOptions: { port: config.port },
        keyspace: config.keyspace,
        queryOptions: { consistency: Cassandra.consistencies.one }
      },
      ormOptions: {
        defaultReplicationStrategy: {
          class: 'SimpleStrategy',
          replication_factor: 1
        },
        dropTableOnSchemaChange: false,
        createKeyspace: true
      }
    };
  }


  var dbVersionCheck = function() {
    var client = Cassandra.createClient(get_options(config));
    var version = client.loadSchema('version', VersionModel, function(err){
      if (err) {return self.emit('send-error', err, 'dbVersionCheck()'); }

      version.find({$limit: 1}, function(err, result) {
        if(err) {return self.emit('send-error', err, 'dbVersionCheck()');}
        if(result.length > 0) {
          client.close();
          return self.emit('open-connection');
        } else {
          return self.emit('udt-load', client);
        }
      });
    });
    log.debug('Database VersionCheck', 'Done');
  }


  var udtLoad = function(client) {
    log.debug('Database udtLoad', 'Started');
    let i=0,
        Table = client.instance.version,
        dbTypes = [user_car, user_favorite_garage];

    function loop() {
      if(i<(dbTypes.length)) {
        Table.execute_query(dbTypes[i], null, null, function(err, result){
          if(err) {return self.emit('send-error', err, 'udtLoad()');}

          i++;
          loop();
        });
      } else {
        var version = new Table({change:1});
        version.save(function(err) {
        if (err) {return self.emit('send-error', err, 'udtLoad()'); }
          client.close();
          return self.emit('open-connection');
        });
      }
    }
    loop();
  }


  var openConnection = function() {
    log.debug('Database openConnection', 'Started');
    Cassandra.setDirectory(__dirname + '/entities').bind(get_options(config),
      function(err) {
        if(err) {
            log.debug('Database openConnection', 'Error',err);
            return self.emit('send-error', err, 'openConnection()');
        }
        log.debug('Database openConnection', 'Done');
        if(continueWith){
          continueWith(null, Cassandra);
        }
      }
    );
  }

  // Send an Error
  var sendError = function(err, message) {
    var error = new Verror(err, message);
    log.error('Failure: ' + JSON.stringify(error, null, 2));

    if(continueWith) {
      continueWith(err, null);
    }
  }

  /////////////////////////////////////////

  self.connect = function(configuration, done) {
    log.debug({config: configuration}, 'Database.connect()');
    continueWith = done;
    config = configuration;
    return self.emit('db-version-check');
  };

  // Event Wireup
  self.on('db-version-check', dbVersionCheck);
  self.on('udt-load', udtLoad);
  self.on('open-connection', openConnection)
  self.on('send-error', sendError);


  return self;
};

util.inherits(Database, Emitter);
module.exports = Database;