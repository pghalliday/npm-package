npm-package
===========

Command line tool to intitiate a blank npm compatible package with my preferred structure, etc

## Features

- should copy the template files into the current directory
- should default repository and package names based on the current directory name
- should take command line input for package specific fields

## Installation

```
npm install -g npm-package
```

## Usage

```
V:\GitHub\test-npm-package>npm-package
npm-package: Package name: (test-npm-package)
npm-package: Repository name: (test-npm-package)
npm-package: Short description: A short description

V:\GitHub\test-npm-package>
```

## Roadmap

- should use a default configuration for the author information if it exists
- should allow package.json keywords to be added
- should create default configuration if it does not exist
- should update default configuration if requested

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using ``./grunt.sh`` or ``.\grunt.bat``.

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Peter Halliday  
Licensed under the MIT license.