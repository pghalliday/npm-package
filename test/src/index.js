var expect = require('chai').expect,
    spawn = require('child_process').spawn,
    Checklist = require('checklist'),
    fs = require('fs-extra');

var templateDirectory = './template',
    testOutputDirectoryName = 'TestOutput',
    testOutputDirectory = __dirname + '/' + testOutputDirectoryName;

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
    fs.exists(testOutputDirectory, function(exists) {
      if (exists) {
        fs.remove(testOutputDirectory, function(error) {
          if (error) {
            done(error);
          } else {
            fs.mkdirp(testOutputDirectory, done);
          }
        });
      } else {
        fs.mkdirp(testOutputDirectory, done);
      }
    });
  });

  it('should copy the template files and folders into the current directory and apply defaults', function(done) {
    var savedError;
    var files = getFiles(templateDirectory);
    var child = spawn('node', ['../../../'], {
      cwd: testOutputDirectory,
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
        var newFiles = getFiles(testOutputDirectory);
        expect(newFiles).to.deep.equal(files);
        for (var i = 0; i < files.length; i++) {
          if (fs.statSync(templateDirectory + '/' + files[i]).isDirectory()) {
            expect(fs.statSync(templateDirectory + '/' + files[i]).isDirectory()).to.equal(true);
          } else {
            var templateFile = fs.readFileSync(templateDirectory + '/' + files[i], 'utf8');
            // templateFile = templateFile.replace('%PACKAGE_NAME%', testOutputDirectoryName);
            // templateFile = templateFile.replace('%REPOSITORY_NAME%', testOutputDirectoryName);
            // templateFile = templateFile.replace('%SHORT_DESCRIPTION%', '');
            var outputFile = fs.readFileSync(testOutputDirectory + '/' + files[i], 'utf8');
            expect(outputFile).to.equal(templateFile);
          }
        }
        done();
      }
    });
  });

  it('should accept input', function(done) {
    var checklist = new Checklist([
      'npm-package: Package name: (' + testOutputDirectoryName + ') ',
      'npm-package: Repository name: (' + testOutputDirectoryName + ') ',
      'npm-package: Short description: ',
      'apple\n' +
      'banana\n' +
      'pear\n',
      0,
      null
    ], done);
    var result = '';
    var child = spawn('node', ['../../../'], {
      cwd: testOutputDirectory,
      stdio: 'pipe',
      detached: false
    });
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', function(data) {
      // should not get here so this will
      // cause checklist to report the error
      checklist.check(new Error(data));
    });
    child.stdout.setEncoding('utf8');
    child.stdout.once('data', function(data) {
      checklist.check(data);
      child.stdout.once('data', function(data) {
        checklist.check(data);
        child.stdout.once('data', function(data) {
          checklist.check(data);
          child.stdout.on('data', function(data) {
            result += data;
          });
          child.stdin.write('pear\n');
        });
        child.stdin.write('banana\n');
      });
      child.stdin.write('apple\n');
    });
    child.on('exit', function(code, signal) {
      checklist.check(result);
      checklist.check(code);
      checklist.check(signal);
    });
  });
});
    

