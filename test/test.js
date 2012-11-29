var should = require('should'),
    gitdb = require('../lib/gitdb'),
    path = require('path'),
    fs = require('fs-extra');

var do_cleanup = true;

var cleanup = function (dir) {
  return function (done) {
    var target = path.resolve(__dirname, dir);
    if( !do_cleanup ) { return done(); }
    fs.remove(target, function (err) {
      if (err) { console.error(err); }
      done();
    });
  };
};


describe('gitdb.git', function () {

  after(cleanup('tmp/gitdb_git'));

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

  after(cleanup('tmp/gitdb'));

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
      db.insert('notdata_example', function (err, notdata_example) {
        should.not.exist(err);
        notdata_example.should.be.ok;
        notdata_example.name.should.eql('notdata_example');
        done();
      });
    });

    it('should create files when given data', function (done) {
      var target = path.resolve(__dirname, 'tmp/gitdb/test_insert/create_example/text');
      var data = {
        text: 'What a great bit of text.'
      };
      db.insert('create_example', data, function (err, create_example) {
        should.not.exist(err);
        create_example.should.be.ok;
        fs.exists(target, function (exists) {
          exists.should.be.ok;
          done();
        });
      });
    });

    it('should add and commit files when given data', function (done) {
      var target = path.resolve(__dirname, 'tmp/gitdb/test_insert/commit_example/text');
      var data = {
        text: 'What a great bit of text.'
      };
      db.insert('commit_example', data, function (err, commit_example) {
        should.not.exist(err);
        commit_example.should.be.ok;
        commit_example.repo.status(function (err, status) {
          if (err === "") { err = null; }
          should.not.exist(err);
          status.staged.length.should.eql(0);
          status.not_staged.length.should.eql(0);
          status.untracked.length.should.eql(0);
          done();
        });
      });
    });

  });

  describe('get', function () {

    var db;
    var test_data = {
      html: 'html',
      css: 'css'
    };

    before(function (done) {
      gitdb.connect('test_get', function (err, db_handle) {
        db = db_handle;
        db.insert('example', test_data, function (err, example) {
          done();
        });
      });
    });

    it('should return data from and a handle to an existing repo', function (done) {
      db.get('example', function (err, data, example) {
        should.not.exist(err);
        data.should.be.ok;
        data.html.should.be.ok;
        data.css.should.be.ok;
        example.should.be.ok;
        done();
      });
    });

  });

});