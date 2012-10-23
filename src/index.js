module.exports = function(callback) {
  var prompt = require('prompt'),
      path = require('path'),
      Boilerplate = require('./util/Boilerplate');

  var TEMPLATE_DIRECTORY = __dirname + '/../template';

  prompt.start();

  var schema = {
    properties: {
      packageName: {
        pattern: /^[a-zA-Z\s\-]+$/,
        message: 'Package name must be only letters, spaces, or dashes',
        required: true,
        default: path.basename(process.cwd()),
        description: 'Package name'
      },
      repositoryName: {
        pattern: /^[a-zA-Z\s\-]+$/,
        message: 'Repository name must be only letters, spaces, or dashes',
        required: true,
        default: path.basename(process.cwd()),
        description: 'Repository name'
      },
      shortDescription: {
        description: 'Short description'
      }
    }
  };

  prompt.message = 'npm-package';
  prompt.delimiter = ': ';
  prompt.colors = false;

  prompt.get(schema, function(error, result) {
    var boilerplate = new Boilerplate(TEMPLATE_DIRECTORY, [{
      what: '%PACKAGE_NAME%',
      with: result.packageName
    }, {
      what: '%REPOSITORY_NAME%',
      with: result.repositoryName
    }, {
      what: '%SHORT_DESCRIPTION%',
      with: result.shortDescription
    }]);
    
    boilerplate.generate(process.cwd(), callback);
  });
};