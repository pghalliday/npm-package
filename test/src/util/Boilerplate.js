var expect = require('chai').expect,
    fs = require('fs-extra'),
    Checklist = require('checklist'),
    Boilerplate = require('../../../src/util/Boilerplate');

var TEST_TEMPLATE_DIRECTORY = __dirname + '/../../sandbox/TestTemplate',
    TEST_OUTPUT_DIRECTORY = __dirname + '/../../sandbox/TestOutput',
    REPLACEMENTS = [{
      what: 'l',
      with: 'r'
    }, {
      what: 'foo',
      with: 'foo2'
    }];


function getFiles(directory, parent, result) {
  if (!result) {
    result = [];    
  }
  var files = fs.readdirSync(directory);
  for (var i = 0; i < files.length; i++) {
    result.push(parent ? parent + '/' + files[i] : files[i]);
    var filePath = directory + '/' + files[i];
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, parent ? parent + '/' + files[i] : files[i], result);
    }
  }
  return result;
}

describe('Boilerplate', function() {
  describe('#generate', function() {
    var files;

    before(function() {
      files = getFiles(TEST_TEMPLATE_DIRECTORY);
    });

    beforeEach(function(done) {
      fs.exists(TEST_OUTPUT_DIRECTORY, function(exists) {
        if (exists) {
          fs.remove(TEST_OUTPUT_DIRECTORY, function(error) {
            if (error) {
              done(error);
            } else {
              fs.mkdirp(TEST_OUTPUT_DIRECTORY, done);
            }
          });
        } else {
          fs.mkdirp(TEST_OUTPUT_DIRECTORY, done);
        }
      });
    });

    it('should copy the template files to the given folder', function(done) {
      var boilerplate = new Boilerplate(TEST_TEMPLATE_DIRECTORY);
      boilerplate.generate(TEST_OUTPUT_DIRECTORY, function(error) {
        expect(error).to.be.an('undefined');
        var checklist = new Checklist(getFiles(TEST_OUTPUT_DIRECTORY), done);
        for (var i = 0; i < files.length; i++) {
          var path = files[i];
          var templatePath = TEST_TEMPLATE_DIRECTORY + '/' + path;
          var outputPath = TEST_OUTPUT_DIRECTORY + '/' + path;
          if (fs.statSync(templatePath).isDirectory()) {
            expect(fs.statSync(outputPath).isDirectory()).to.equal(true);
          } else {
            var templateFile = fs.readFileSync(templatePath, 'utf8');
            var outputFile = fs.readFileSync(outputPath, 'utf8');
            expect(outputFile).to.equal(templateFile);
          }
          checklist.check(path);
        }        
      });
    });

    it('should make replacements in the files and file names it copies', function(done) {
      var boilerplate = new Boilerplate(TEST_TEMPLATE_DIRECTORY, REPLACEMENTS);
      boilerplate.generate(TEST_OUTPUT_DIRECTORY, function(error) {
        expect(error).to.be.an('undefined');
        var checklist = new Checklist(getFiles(TEST_OUTPUT_DIRECTORY), done);
        for (var i = 0; i < files.length; i++) {
          var path = files[i];
          var templatePath = TEST_TEMPLATE_DIRECTORY + '/' + path;
          path = path.replace(/l/g, 'r');
          path = path.replace(/foo/g, 'foo2');
          var outputPath = TEST_OUTPUT_DIRECTORY + '/' + path;
          if (fs.statSync(templatePath).isDirectory()) {
            expect(fs.statSync(outputPath).isDirectory()).to.equal(true);
          } else {
            var templateFile = fs.readFileSync(templatePath, 'utf8');
            templateFile = templateFile.replace(/l/g, 'r');
            templateFile = templateFile.replace(/foo/g, 'foo2');
            var outputFile = fs.readFileSync(outputPath, 'utf8');
            expect(outputFile).to.equal(templateFile);
          }
          checklist.check(path);
        }        
      });
    });

    it('should fail gracefully on errors', function(done) {
      var boilerplate = new Boilerplate(TEST_TEMPLATE_DIRECTORY, [{
        what: 'Hello.txt',
        with: 'Cannot create/directories'
      }]);
      boilerplate.generate(TEST_OUTPUT_DIRECTORY, function(error) {
        expect(error).to.be.an('array');
        expect(error.length).to.equal(1);
        expect(error[0]).to.be.an('error');
        done();
      });
    });

    after(function(done) {
      fs.remove(TEST_OUTPUT_DIRECTORY, done);
    });
  });
});