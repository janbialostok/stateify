/*
 * pushie
 * http://github.com/yawetse/pushie
 *
 * Copyright (c) 2015 Typesettin. All rights reserved.
 */

'use strict';
var path = require('path');
	// sample_middleware = require('./resources/js/sample_middleware');

module.exports = function (grunt) {
	grunt.initConfig({
	  mocha_istanbul: {
      coveralls: {
        src: ['test/**/*.js'], // multiple folders also works
        options: {
        	coverageFolder: 'coverage', // will check both coverage folders and merge the coverage results
          coverage:true, // this will make the grunt.event.on('coverage') event listener to be triggered
          check: {
            lines: 5,
            branches: 5,
            functions: 5,
            statements: 5
          },
          // root: './lib', // define where the cover task should consider the root of libraries that are covered by tests
          reportFormats: ['cobertura','lcovonly']
        }
      }
    },
		simplemocha: {
			options: {
				globals: ['should', 'window'],
				timeout: 3000,
				ignoreLeaks: false,
				ui: 'bdd',
				reporter: 'spec'
			},
			all: {
				src: 'test/**/*.js'
			}
		},
    coveralls: {
    // Options relevant to all targets
	    options: {
	      // When true, grunt-coveralls will only print a warning rather than
	      // an error, to prevent CI builds from failing unnecessarily (e.g. if
	      // coveralls.io is down). Optional, defaults to false.
	      force: false,
	      excludes: ['**/bin/**']
	    },

	    all: {
	      // LCOV coverage file (can be string, glob or array)
	      src: 'coverage/*.info',
	      options: {
	        // Any options for just this target
	      }
	    },
	  },
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			all: [
				'Gruntfile.js',
				'index.js',
				'lib/**/*.js',
				'resources/**/*.js',
				'resources/**/*.ejs',
				'test/**/*.js',
			]
		},
		jsbeautifier: {
			files: ['<%= jshint.all %>', '!resources/template/pushie.ejs'],
			options: {
				config: '.jsbeautify'
			}
		},
		jsdoc: {
			dist: {
				src: ['lib/*.js', 'index.js'],
				options: {
					destination: 'doc/html',
					configure: 'jsdoc.json'
				}
			}
		},
		browserify: {
      dist: {
        files: [{
          expand: true,
          cwd: __dirname,
          src: ['./index.js'],
          dest: 'bin'
        }],
        options: {
          transform: [
            ["babelify", {
              presets: ["es2015"]
            }]
          ]
        }
      }
    }
	});


	// Loading dependencies
	for (var key in grunt.file.readJSON('package.json').devDependencies) {
		if (key.indexOf('grunt') === 0 && key !== 'grunt') {
			grunt.loadNpmTasks(key);
		}
	}

	grunt.registerTask('default', ['jshint', 'mocha_istanbul']);
	grunt.registerTask('lint', 'jshint', 'jsbeautifier');
	grunt.registerTask('packagejs', ['browserify', 'uglify']);
	grunt.registerTask('doc', 'jsdoc');
	grunt.registerTask('test', 'mocha_istanbul');
	grunt.registerTask('html', 'newer:template');
};
