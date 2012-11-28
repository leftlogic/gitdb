var should = require('should'),
    gittest = require('../lib/gitdb'),
    path = require('path'),
    fs = require('fs-extra');

describe('gitdb thing', function () {

  after(function (done) {
    var target = path.resolve(__dirname, './tmp');
    fs.remove(target, function (err) {
      if (err) { console.error(err); }
      done();
    });
  });


  it('should create a new folder for repo', function (done) {
    var target = path.resolve(__dirname, './tmp/new_folder');
    gittest.repo(target, function (err, repo) {
      should.not.exist(null);
      fs.exists(target, function (exists) {
        exists.should.be.ok;
        done();
      });
    });
  });

  it('should create a new git repo', function (done) {
    var target = path.resolve(__dirname, './tmp/new_repo'),
        target_git = path.resolve(__dirname, './tmp/new_repo/.git');
    gittest.repo(target, function (err, repo) {
      should.not.exist(null);
      fs.exists(target_git, function (exists) {
        exists.should.be.ok;
        done();
      });
    });
  });

});