/*global module:false*/
module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        meta: {
            version: '<%= pkg.version %>',
            banner:
                '// Backbone.Minionette\n' +
                '// -------------------\n' +
                '// v<%= pkg.version %>\n' +
                '//\n' +
                '// Copyright (c)<%= grunt.template.today("yyyy") %> Justin Ridgewell\n' +
                '// Distributed under MIT license\n' +
                '//\n' +
                '// https://github.com/jridgewell/minionette\n' +
                '\n'
        },

        preprocess: {
            build: {
                files: {
                    'lib/minionette.js' : 'src/build/minionette.js'
                }
            },
            amd: {
                files: {
                    'lib/amd/minionette.js' : 'src/build/amd.js'
                }
            },
        },

        uglify : {
            options: {
                banner: "<%= meta.banner %>"
            },
            amd : {
                src : 'lib/amd/minionette.js',
                dest : 'lib/amd/minionette.min.js',
            },
            core : {
                src : 'lib/minionette.js',
                dest : 'lib/minionette.min.js',
                options : {
                    sourceMap : 'lib/minionette.map',
                    sourceMapPrefix : 1,
                }
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
                    jshint : grunt.file.readJSON('.jshintrc')
                }
            }
        },

        docco: {
            src: ['src/*.js'],
            options: {
                output: 'docs/'
            }
        },

        mocha: {
            browser: ['spec/spec.html'],
            options: {
                // run: true
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-preprocess');
    grunt.loadNpmTasks('grunt-plato');
    grunt.loadNpmTasks('grunt-docco2');
    grunt.loadNpmTasks('grunt-mocha');

    // Default task.
    grunt.registerTask('test', ['mocha']);
    grunt.registerTask('default', ['jshint', 'preprocess', 'uglify']);

};
