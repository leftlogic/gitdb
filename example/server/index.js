var connect = require('connect'),
    path = require('path'),
    portfinder = require('portfinder'),
    gitdb = require('../../lib/gitdb.js');

var db;

gitdb.config.root = path.resolve(__dirname, '../db');

var save = function (body, cb) {
  console.log(body);
  if (!(body.id && body.data)) { return cb({error: 'Missing id or data.', body: body}); }
  db.insert(body.id, body.data, function (err, data) {
    cb(err || body);
  });
};

var get = function (id, cb) {
  db.get(id, function (err, data) {
    cb(err || data);
  });
};

var app = connect();
app
  .use(connect.logger('dev'))
  .use(connect.bodyParser())
  .use(connect.query())
  .use(connect.compress())
  .use(function (req, res, next) {
    console.log(req.query);
    if( req.url === '/save' && req.method.match(/post/i) ) {
      save(req.body, function (result) {
        res.end(JSON.stringify(result));
      });
    } else if( req.url.match(/\/get/i) && req.method.match(/get/i) && req.query.id ) {
      get(req.query.id, function (result) {
        res.end(JSON.stringify(result));
      });
    } else {
      next();
    }
  })
  .use(connect.static(path.resolve(__dirname, '../public')))

gitdb.connect('textarea', function (err, db_handle) {
  if (err) { return console.log(err); }
  db = db_handle;
  portfinder.getPort(function (err, port) {
    app.listen(port);
    console.log('Server listening on port %d', port);
  });
});
    