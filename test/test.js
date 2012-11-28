var should = require('should'),
    gitdb = require('../lib/gitdb'),
    path = require('path'),
    fs = require('fs-extra');

describe('gitdb.git', function () {

  after(function (done) {
    var target = path.resolve(__dirname, 'tmp/gitdb_git');
    fs.remove(target, function (err) {
      if (err) { console.error(err); }
      done();
    });
  });

  it('should create a new folder for repo', function (done) {
    var target = path.resolve(__dirname, 'tmp/gitdb_git/new_folder');
    gitdb.git.create_repo(target, function (err, repo) {
      should.not.exist(null);
      fs.exists(target, function (exists) {
        exists.should.be.ok;
        done();
      });
    });
  });

  it('should create a new git repo', function (done) {
    var target = path.resolve(__dirname, 'tmp/gitdb_git/new_repo'),
        target_git = path.resolve(__dirname, 'tmp/gitdb_git/new_repo/.git');
    gitdb.git.create_repo(target, function (err, repo) {
      should.not.exist(null);
      fs.exists(target_git, function (exists) {
        exists.should.be.ok;
        done();
      });
    });
  });

});

describe('gitdb', function () {

  before(function () {
    gitdb.config.root = path.resolve(__dirname, 'tmp/gitdb');
  });

  after(function (done) {
    var target = path.resolve(__dirname, 'tmp/gitdb');
    fs.remove(target, function (err) {
      if (err) { console.error(err); }
      done();
    });
  });

  describe('connect', function () {

    it('should create a new directory when a non-existant db is connected to', function (done) {
      var target = path.resolve(__dirname, 'tmp/gitdb/test_connect');
      gitdb.connect('test_connect', function (err, db) {
        should.not.exist(err);
        db.should.be.ok;
        db.name.should.eql('test_connect');
        fs.exists(target, function (exists) {
          exists.should.be.ok;
          done();
        });
      });
    });

  });

  describe('insert', function () {

    var db;

    before(function (done) {
      gitdb.connect('test_insert', function (err, db_handle) {
        db = db_handle;
        done();
      });
    });

    it('should return a handle to a new repo', function (done) {
      db.insert('example', function (err, example) {
        should.not.exist(err);
        example.should.be.ok;
        example.name.should.eql('example');
        done();
      });
    });

  });

});