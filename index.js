var db = require('./lib/gitdb');

db.connect('jsbin', function (err, db) {
  var data = {
    html: '<!doctype html>\n<meta charset="uft-8">\n<title>test</title>',
    css: 'body {\n  background:red;\n}'
  };
  var i = 100;
  while(i--) {
    (function (i) {
      db.insert('madope-' + i, data, function (err, madope) {
        console.log(i);
      });
    }(i))
  }
});