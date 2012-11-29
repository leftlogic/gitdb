var path = require('path'),
    fs = require('fs-extra'),
    git = require('gitty'),
    async = require('async');

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

// ==============================
// Handle
// ==============================

gitdb.handle = {};

gitdb.handle.init = function (root) {
  this.name = path.basename(root);
  this.root = root;
  return this;
};

gitdb.handle.insert = function (name, data, cb) {
  if (typeof data === 'function') {
    cb = data;
    data = {};
  } else if(data === undefined) {
    cb = function () {};
  }
  var target = path.resolve(this.root, name);
  gitdb.git.create_repo(target, function (err, raw_repo) {
    var repo = Object.create(gitdb.repo);
    repo.init(target, raw_repo).set(data, cb);
  });
  return this;
};

// Repo

gitdb.repo = {};

gitdb.repo.init = function (root, repo) {
  this.repo = repo;
  this.name = path.basename(root);
  this.root = root;
  return this;
};

gitdb.repo.set = function (data, cb) {
  cb = cb || function () {};

  var files = Object.keys(data);
  if (files.length === 0) { return cb(null, this); }

  async.forEach(files, function (file, done) {

    // Write data to the files
    var target = path.resolve(this.root, file);
    fs.writeFile(target, data[file], done);

  }.bind(this), function (async_err) {
    if (async_err) { cb(async_err, this); }

    // Add the files to the repo
    this.repo.add(files, function (add_err) {
      if (add_err === "") { add_err = null; }
      if (add_err) { cb(add_err, this); }

      // Commit the files
      this.repo.commit('.', function (commit_err) {
        if (commit_err === "") { commit_err = null; }
        cb(commit_err, this);
      }.bind(this));

    }.bind(this));

  }.bind(this));
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