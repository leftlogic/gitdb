var db = require('./lib/gitdb');
var async = require('async');

var overall = process.hrtime();

var done_count = 0;
var avg;
var done = function () {
  overall = process.hrtime(overall);
  console.log('benchmark took %d seconds', overall[0] + (overall[1] / 1000000000));
  // console.log('average read took %d seconds', avg);
};


db.connect('jsbin', function (err, db) {
  var data = {
    html: '<!doctype html>\n<meta charset="uft-8">\n<title>test</title>',
    css: 'body {\n  background:red;\n}'
  };

  var fns = (new Array(100)).join(',').split(',');
  fns = fns.map(function (_, index) {
    return function (write_done) {
      db.insert('bin-'+index, data, function (err) {
        if( err ) console.log(err);
        write_done();
      });
    };
  });

  async.parallel(fns, done);

});