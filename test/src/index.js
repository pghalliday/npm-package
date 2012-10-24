var expect = require('chai').expect,
    spawn = require('child_process').spawn,
    Checklist = require('checklist'),
    fs = require('fs-extra');

var TEMPLATE_DIRECTORY = './template',
    TEST_OUTPUT_DIRECTORY_NAME = 'TestOutput',
    TEST_OUTPUT_DIRECTORY = __dirname + '/../sandbox/' + TEST_OUTPUT_DIRECTORY_NAME;

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

describe('npm-package', function() {
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

  it('should copy the template files and folders into the current directory and apply defaults', function(done) {
    var savedError;
    var files = getFiles(TEMPLATE_DIRECTORY);
    var child = spawn('node', ['../../../bin/npm-package'], {
      cwd: TEST_OUTPUT_DIRECTORY,
      stdio: 'pipe',
      detached: false
    });
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', function(data) {
      savedError = new Error(data);
    });
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', function(data) {
      child.stdin.write('\n');
    });
    child.on('exit', function(code, signal) {
      if (savedError) {
        done(savedError);
      } else {
        var checklist = new Checklist(getFiles(TEST_OUTPUT_DIRECTORY), done);
        for (var i = 0; i < files.length; i++) {
          var path = files[i];
          var templatePath = TEMPLATE_DIRECTORY + '/' + path;
          path = path.replace(/%GITIGNORE%/g, '.gitignore');
          path = path.replace(/%PACKAGE_NAME%/g, TEST_OUTPUT_DIRECTORY_NAME);
          path = path.replace(/%REPOSITORY_NAME%/g, TEST_OUTPUT_DIRECTORY_NAME);
          path = path.replace(/%SHORT_DESCRIPTION%/g, '');
          var outputPath = TEST_OUTPUT_DIRECTORY + '/' + path;
          if (fs.statSync(templatePath).isDirectory()) {
            expect(fs.statSync(outputPath).isDirectory()).to.equal(true);
          } else {
            var templateFile = fs.readFileSync(templatePath, 'utf8');
            templateFile = templateFile.replace(/%GITIGNORE%/g, '.gitignore');
            templateFile = templateFile.replace(/%PACKAGE_NAME%/g, TEST_OUTPUT_DIRECTORY_NAME);
            templateFile = templateFile.replace(/%REPOSITORY_NAME%/g, TEST_OUTPUT_DIRECTORY_NAME);
            templateFile = templateFile.replace(/%SHORT_DESCRIPTION%/g, '');
            var outputFile = fs.readFileSync(outputPath, 'utf8');
            expect(outputFile).to.equal(templateFile);
          }
          checklist.check(path);
        }
      }
    });
  });

  it('should copy the template files and folders into the current directory and apply fields suplied to stdin', function(done) {
    var savedError;
    var files = getFiles(TEMPLATE_DIRECTORY);
    var child = spawn('node', ['../../../bin/npm-package'], {
      cwd: TEST_OUTPUT_DIRECTORY,
      stdio: 'pipe',
      detached: false
    });
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', function(data) {
      savedError = new Error(data);
    });
    child.stdout.setEncoding('utf8');
    child.stdout.once('data', function(data) {
      child.stdout.once('data', function(data) {
        child.stdout.once('data', function(data) {
          child.stdin.write('pear\n');
        });
        child.stdin.write('banana\n');
      });
      child.stdin.write('apple\n');
    });
    child.on('exit', function(code, signal) {
      if (savedError) {
        done(savedError);
      } else {
        var checklist = new Checklist(getFiles(TEST_OUTPUT_DIRECTORY), done);
        for (var i = 0; i < files.length; i++) {
          var path = files[i];
          var templatePath = TEMPLATE_DIRECTORY + '/' + path;
          path = path.replace(/%GITIGNORE%/g, '.gitignore');
          path = path.replace(/%PACKAGE_NAME%/g, TEST_OUTPUT_DIRECTORY_NAME);
          path = path.replace(/%REPOSITORY_NAME%/g, TEST_OUTPUT_DIRECTORY_NAME);
          path = path.replace(/%SHORT_DESCRIPTION%/g, '');
          var outputPath = TEST_OUTPUT_DIRECTORY + '/' + path;
          if (fs.statSync(templatePath).isDirectory()) {
            expect(fs.statSync(outputPath).isDirectory()).to.equal(true);
          } else {
            var templateFile = fs.readFileSync(templatePath, 'utf8');
            templateFile = templateFile.replace(/%GITIGNORE%/g, '.gitignore');
            templateFile = templateFile.replace(/%PACKAGE_NAME%/g, 'apple');
            templateFile = templateFile.replace(/%REPOSITORY_NAME%/g, 'banana');
            templateFile = templateFile.replace(/%SHORT_DESCRIPTION%/g, 'pear');
            var outputFile = fs.readFileSync(outputPath, 'utf8');
            expect(outputFile).to.equal(templateFile);
          }
          checklist.check(path);
        }
      }
    });
  });
  
  it('should create a .gitignore file to ignore the node_modules file', function(done) {
    var savedError;
    var files = getFiles(TEMPLATE_DIRECTORY);
    var child = spawn('node', ['../../../bin/npm-package'], {
      cwd: TEST_OUTPUT_DIRECTORY,
      stdio: 'pipe',
      detached: false
    });
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', function(data) {
      savedError = new Error(data);
    });
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', function(data) {
      child.stdin.write('\n');
    });
    child.on('exit', function(code, signal) {
      if (savedError) {
        done(savedError);
      } else {
        fs.readFile(TEST_OUTPUT_DIRECTORY + '/.gitignore', 'utf8', function(error, file) {
          expect(error).to.equal(null);
          expect(file.indexOf('node_modules')).to.not.equal(-1);
          done();
        });
      }
    });
  });
  
  it('should make grunt.sh executable on *nix', function(done) {
    if (process.platform === 'win32') {
      done();
    } else {
      var savedError;
      var files = getFiles(TEMPLATE_DIRECTORY);
      var child = spawn('node', ['../../../bin/npm-package'], {
        cwd: TEST_OUTPUT_DIRECTORY,
        stdio: 'pipe',
        detached: false
      });
      child.stderr.setEncoding('utf8');
      child.stderr.on('data', function(data) {
        savedError = new Error(data);
      });
      child.stdout.setEncoding('utf8');
      child.stdout.on('data', function(data) {
        child.stdin.write('\n');
      });
      child.on('exit', function(code, signal) {
        if (savedError) {
          done(savedError);
        } else {
          var errorData = '';
          var child = spawn('./grunt.sh', [], {
            cwd: TEST_OUTPUT_DIRECTORY,
            stdio: 'pipe',
            detached: false
          });
          child.stderr.setEncoding('utf8');
          child.stderr.on('data', function(data) {
            errorData += data;
          });
          child.on('exit', function(code, signal) {
            // If the shell script is executable then we should
            // get the grunt not found error as npm install has
            // not been run yet
            expect(errorData).to.match(/node_modules\/.bin\/grunt: not found/);
            done();
          });
        }
      });
    }
  });

  after(function(done) {
    fs.remove(TEST_OUTPUT_DIRECTORY, done);
  });
});
    

