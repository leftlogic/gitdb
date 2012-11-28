var path = require('path'),
    fs = require('fs-extra');

var git = require('gitty');

var gittest = {};

gittest.repo = function (path, cb) {
  fs.mkdirp(path, function (err) {
    if (err) { return console.error(err); }
    gittest.init(path, cb);
  });
};

gittest.init = function (path, cb) {
  var repo = new git.Repository(path);
  if (repo.isRepository) { return cb(null, repo); }
  repo.init(function (err) {
    cb(err, repo);
  });
};

module.exports = gittest;