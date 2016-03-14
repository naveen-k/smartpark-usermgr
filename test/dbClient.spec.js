/* jshint -W024, -W101, -W079, -W098 -W031 */
/* jshint expr:true */
'use strict';

const should = require('chai').should();
const models = require('irvui-express-cassandra');
const DbClient = require('../lib/dbClient');
const config = require('./config');

describe('Database Connection', function() {
  let db;

  before(function(done) {
    db = new DbClient();
    done();
  });

  it('should connect and sync with db without errors', function (done) {
    this.timeout(5000);
    this.slow(1000);
    db.connect(config.db, function(err, db) {
      (err === null).should.be.true;
      db.instance.Garage.should.exist;
      done();
    });
  });
});