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
        var newFiles = getFiles(TEST_OUTPUT_DIRECTORY);
        for (var i = 0; i < files.length; i++) {
          if (fs.statSync(TEMPLATE_DIRECTORY + '/' + files[i]).isDirectory()) {
            expect(fs.statSync(TEMPLATE_DIRECTORY + '/' + files[i]).isDirectory()).to.equal(true);
          } else {
            var templateFile = fs.readFileSync(TEMPLATE_DIRECTORY + '/' + files[i], 'utf8');
            templateFile = templateFile.replace(/%PACKAGE_NAME%/g, TEST_OUTPUT_DIRECTORY_NAME);
            templateFile = templateFile.replace(/%REPOSITORY_NAME%/g, TEST_OUTPUT_DIRECTORY_NAME);
            templateFile = templateFile.replace(/%SHORT_DESCRIPTION%/g, '');
            var outputFile = fs.readFileSync(TEST_OUTPUT_DIRECTORY + '/' + files[i], 'utf8');
            expect(outputFile).to.equal(templateFile);
          }
        }
        done();
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
        var newFiles = getFiles(TEST_OUTPUT_DIRECTORY);
        for (var i = 0; i < files.length; i++) {
          if (fs.statSync(TEMPLATE_DIRECTORY + '/' + files[i]).isDirectory()) {
            expect(fs.statSync(TEMPLATE_DIRECTORY + '/' + files[i]).isDirectory()).to.equal(true);
          } else {
            var templateFile = fs.readFileSync(TEMPLATE_DIRECTORY + '/' + files[i], 'utf8');
            templateFile = templateFile.replace(/%PACKAGE_NAME%/g, 'apple');
            templateFile = templateFile.replace(/%REPOSITORY_NAME%/g, 'banana');
            templateFile = templateFile.replace(/%SHORT_DESCRIPTION%/g, 'pear');
            var outputFile = fs.readFileSync(TEST_OUTPUT_DIRECTORY + '/' + files[i], 'utf8');
            expect(outputFile).to.equal(templateFile);
          }
        }
        done();
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
          expect(file).to.equal('node_modules');
          done();
        });
      }
    });
  });
  
  it('should make grunt.sh or grunt.bat executable', function(done) {
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
        var gruntCommand = process.platform === 'win32' ? '.\\grunt.bat' : './grunt.sh';
        var child = spawn(gruntCommand, [], {
          cwd: TEST_OUTPUT_DIRECTORY,
          stdio: 'pipe',
          detached: false
        });
        child.on('exit', function(code, signal) {
          expect(code).to.equal(0);
          done();
        });
      }
    });
  });
});
    

