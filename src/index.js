var prompt = require('prompt'),
    path = require('path'),
    fs = require('fs-extra');

var TEMPLATE_DIRECTORY = './template';

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
  console.log(result.packageName);
  console.log(result.repositoryName);
  console.log(result.shortDescription);

  fs.copy(TEMPLATE_DIRECTORY, process.cwd(), function(error) {
    if (error) {
      console.error(error);
    }
  });
});