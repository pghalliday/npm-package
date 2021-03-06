module.exports = function(callback) {
  var prompt = require('prompt'),
      path = require('path'),
      fs = require('fs'),
      Boilerplate = require('simple-boilerplate');

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
    }, {
      what: '%GITIGNORE%',
      with: '.gitignore'
    }]);
    
    boilerplate.generate(process.cwd(), function(error) {
      if (error) {
        callback(error);
      } else {
        fs.chmod(process.cwd() + '/grunt.sh', '755', callback);
        callback();
      }
    });
  });
};
