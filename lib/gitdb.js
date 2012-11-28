var path = require('path'),
    fs = require('fs-extra');

var git = require('gitty');

var gitdb = {};

gitdb.config = {
  root: path.resolve(process.cwd(), 'db')
};

gitdb.connect = function (target, cb) {
  var root = path.resolve(gitdb.config.root, target);
  fs.mkdirp(root, function (err) {
    if (err) { return cb(err); }
    else { cb(err, gitdb.dummy); }
  });
};

gitdb.dummy = {};

gitdb.dummy.get = function (name, cb) {
  cb(null, {});
};

gitdb.git = {};

gitdb.git.create_repo = function (path, cb) {
  fs.mkdirp(path, function (err) {
    if (err) { return cb(err); }
    gitdb.git.init(path, cb);
  });
};

gitdb.git.init = function (path, cb) {
  var repo = new git.Repository(path);
  if (repo.isRepository) { return cb(new Error("Repository already exists.")); }
  repo.init(function (err) {
    cb(err, repo);
  });
};

module.exports = gitdb;