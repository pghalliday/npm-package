var fs = require('fs-extra');

fs.copy(__dirname + '/testCopy', __dirname + '/test', function(error) {
  console.log(error);
});
