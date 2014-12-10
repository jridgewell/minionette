/*global module:false*/
module.exports = function(grunt) {

    // Load grunt tasks
    require('load-grunt-tasks')(grunt);

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        meta: {
            version: '<%= pkg.version %>'
        },

        preprocess: {
            build: {
                files: {
                    'lib/minionette.js' : 'src/build/minionette.js'
                }
            }
        },

        uglify : {
            core : {
                src : 'lib/minionette.js',
                dest : 'lib/minionette-min.js',
            }
        },

        jshint: {
            options: {
                jshintrc : '.jshintrc'
            },
            minionette : [ 'src/*.js' ]
        },

        plato: {
            minionette : {
                src : 'src/*.js',
                dest : 'reports',
                options : {
                    jshint : false
                }
            }
        },

        karma: {
            unit: {
                configFile: 'karma.conf.js'
            },
            continuous: {
                configFile: 'karma.conf.js',
                singleRun: false,
                autoWatch: true
            },
            coverage: {
                configFile: 'karma.conf.js',
                reporters: ['coverage'],
                preprocessors: {
                    'src/*.js': 'coverage'
                },
                coverageReporter: {
                    type: 'lcov',
                    dir: 'coverage/'
                }
            }
        },

        coveralls: {
            options: {
                coverage_dir: 'coverage',
                force: true
            }
        },

        indent: {
            src: {
                src: ['src/*.js'],
                dest: 'src/build/.tmp/',
                options: {
                    style: 'space',
                    size: 4,
                    change: 1
                }
            }
        }
    });

    // Default task.
    grunt.registerTask('lint-test', 'jshint:test');
    grunt.registerTask('test', 'karma:unit');
    grunt.registerTask('coverage', ['karma:coverage', 'coveralls']);
    grunt.registerTask('travis', ['jshint:minionette', 'test']);
    grunt.registerTask('default', ['jshint:minionette', 'test', 'indent', 'preprocess', 'uglify']);

};
