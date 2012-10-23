var fs = require('fs-extra'),
    Checklist = require('checklist');

function Boilerplate(template, replacements) {
  var self = this;

  self.generate = function(target, callback) {
    fs.mkdirp(target, function(error) {
      if (error) {
        callback(error);
      } else {
        fs.readdir(template, function(error, files) {
          if (error) {
            callback(error);
          } else {
            var checklist = new Checklist(files, callback);
            files.forEach(function(file) {
              var templatePath = template + '/' + file;
              var targetName = file;
              if (replacements) {
                replacements.forEach(function(replacement) {
                  targetName = targetName.replace(replacement.what, replacement.with);
                });
              }
              var targetPath = target + '/' + targetName;
              fs.stat(templatePath, function(error, stat) {
                if (error) {
                  checklist.check(file, error);
                } else {
                  if (stat.isDirectory()) {
                    var boilerplate = new Boilerplate(templatePath, replacements);
                    boilerplate.generate(targetPath, function(error) {
                      checklist.check(file, error);
                    });
                  } else {
                    if (replacements) {
                      fs.readFile(templatePath, 'utf8', function(error, buffer) {
                        if (error) {
                         checklist.check(file, error);
                        } else {
                          replacements.forEach(function(replacement) {
                            buffer = buffer.replace(replacement.what, replacement.with);
                          });
                          fs.writeFile(targetPath, buffer, 'utf8', function(error) {
                            checklist.check(file, error);
                          });
                        }
                      });
                    } else {
                      fs.copy(templatePath, targetPath, function(error) {
                        checklist.check(file, error);
                      });
                    }
                  }
                }
              });
            });
          }
        });
      }
    });
  };
}

module.exports = Boilerplate;