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
                    'dist/minionette.js' : 'src/build/minionette.js'
                }
            },
            amd: {
                files: {
                    'dist/amd/minionette.js' : 'src/build/amd.js'
                }
            },
        },

        uglify : {
            options: {
                banner: "<%= meta.banner %>"
            },
            amd : {
                src : 'dist/amd/minionette.js',
                dest : 'dist/amd/minionette.min.js',
            },
            core : {
                src : 'dist/minionette.js',
                dest : 'dist/minionette.min.js',
                options : {
                    sourceMap : 'dist/minionette.map',
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
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-preprocess');
    grunt.loadNpmTasks('grunt-plato');

    // Default task.
    grunt.registerTask('default', ['jshint', 'preprocess', 'uglify']);

};
