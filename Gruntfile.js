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
            }
        },

        uglify : {
            options: {
                banner: "<%= meta.banner %>"
            },
            core : {
                src : 'lib/minionette.js',
                dest : 'lib/minionette-min.js',
            }
        },

        jshint: {
            options: {
                jshintrc : '.jshintrc'
            },
            minionette : [ 'src/*.js' ],
            test : [ 'spec/*.js', 'spec/specs/*.js' ],
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

        mocha: {
            browser: ['spec/index.html'],
            options: {
                // run: true
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-preprocess');
    grunt.loadNpmTasks('grunt-plato');
    grunt.loadNpmTasks('grunt-mocha');

    // Default task.
    grunt.registerTask('lint-test', 'jshint:test');
    grunt.registerTask('test', 'mocha');
    grunt.registerTask('travis', ['jshint:minionette', 'mocha']);
    grunt.registerTask('default', ['jshint:minionette', 'test', 'preprocess', 'uglify']);

};
