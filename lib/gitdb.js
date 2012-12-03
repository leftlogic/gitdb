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

gitdb.handle.update = function (name, update_data, cb) {
  if (!(name && update_data)) {
    return cb(new Error("Name and data required."));
  }
  if(!cb) {
    cb = function () {};
  }
  gitdb.handle.get.call(this, name, function (err, get_data, handle) {
    if (err) { return cb(err); }
    handle.set(update_data, cb);
  });
  return this;
};

gitdb.handle.get = function (name, cb) {
  var target = path.resolve(this.root, name);

  // Make sure the repo exists
  fs.exists(target, function (exists) {
    if( !exists ) { return cb(new Error("Not found.")); }

    // Init the repo (does nothing if it's already there)
    gitdb.git.init(target, function (err, raw_repo) {
      if( err ) { return cb(err); }
      // Initialise a handle to that repo, and get the data
      var repo = Object.create(gitdb.repo);
      repo.init(target, raw_repo).get(cb);
    });
  });
  return this;
};

// ==============================
// Repo
// ==============================

gitdb.repo = {};

gitdb.repo.init = function (root, repo) {
  this.repo = repo;
  this.name = path.basename(root);
  this.root = root;
  return this;
};

// Put data into repo files

gitdb.repo.set = function (data, cb) {
  cb = cb || function () {};

  var files = Object.keys(data);
  if (files.length === 0) { return cb(null, this); }

  async.forEach(files, function (filename, done) {

    // Write data to the filenames
    var target = path.resolve(this.root, filename);
    fs.writeFile(target, data[filename], done);

  }.bind(this), function (async_err) {
    if (async_err) { cb(async_err, this); }

    // Add the files to the repo
    this.repo.add(files, function (add_err) {
      if (add_err === "") { add_err = null; }
      if (add_err) { cb(add_err, this); }

      // Commit the files
      this.repo.commit('.', function (commit_err) {
        if (commit_err === "") { commit_err = null; }
        if( commit_err && commit_err.code == 1 ) {
          // No files to commit
          commit_err = null;
        }
        cb(commit_err, this);
      }.bind(this));

    }.bind(this));

  }.bind(this));

  // Chainable
  return this;
};

// Get data from repo files

gitdb.repo.get = function (fields, cb) {
  if( typeof fields === 'function' ) {
    cb = fields;
    fields = {};
  }

  fs.readdir(this.root, function (err, files) {
    if( err ) { return cb(err); }

    // Remove .git
    files = files.filter(function (filename) {
      if( filename === '.git' ) { return false; }
      return true;
    });

    var repo_data = {};

    async.forEach(files, function (filename, done) {

      // Read data from the filenames
      var target = path.resolve(this.root, filename);
      fs.readFile(target, function (err, data) {
        if( err ) { done(err); }
        repo_data[filename] = data.toString();
        done(null);
      });

    }.bind(this), function (async_err) {
      if (async_err) { cb(async_err); }

      // Send it on back
      cb(null, repo_data, this);

    }.bind(this));
  }.bind(this));

  // Chainable
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