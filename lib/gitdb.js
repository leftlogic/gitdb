var path = require('path'),
    fs = require('fs-extra'),
    git = require('gitty');

var gitdb = {};

// Configuration

gitdb.config = {
  root: path.resolve(process.cwd(), 'db')
};

// ==============================
// Public API
// ==============================

// Connect

gitdb.connect = function (target, cb) {
  var root = path.resolve(gitdb.config.root, target);
  fs.mkdirp(root, function (err) {
    if (err) { return cb(err); }
    else {
      var handle = Object.create(gitdb.handle);
      cb(err, handle.init(root));
    }
  });
};

// Handle

gitdb.handle = {};

gitdb.handle.init = function (root) {
  this.name = path.basename(root);
  this.root = root;
  return this;
};

gitdb.handle.insert = function (name, cb) {
  var target = path.resolve(this.root, name);
  gitdb.git.create_repo(target, function (err, raw_repo) {
    var repo = Object.create(gitdb.repo);
    repo.init(target);
    cb(err, repo);
  });

  return this;
};

// Repo

gitdb.repo = {};

gitdb.repo.init = function (root) {
  this.name = path.basename(root);
  this.root = root;
  return this;
};

// ==============================
// Internal API (exposed)
// ==============================

gitdb.git = git;

gitdb.git.create_repo = function (target, cb) {
  fs.mkdirp(target, function (err) {
    if (err) { return cb(err); }
    gitdb.git.init(target, cb);
  });
};

gitdb.git.init = function (target, cb) {
  var repo = new git.Repository(target);
  repo.init(function (err) {
    if (err === "") { err = null; }
    cb(err, repo);
  });
};

module.exports = gitdb;