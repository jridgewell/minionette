// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function(config) {
    config.set({
        // base path, that will be used to resolve files and exclude
        basePath: '',

        // testing framework to use (jasmine/mocha/qunit/...)
        frameworks: ['mocha'],

        reporters: ['dots'],

        // list of files / patterns to load in the browser
        files: [
            'test/support/jquery/dist/jquery.js',
            'test/support/underscore/underscore.js',
            'test/support/backbone/backbone.js',
            'test/support/mocha/mocha.js',
            'test/support/chai/chai.js',
            'test/support/sinon/lib/sinon.js',
            'test/support/sinon/lib/sinon/match.js',
            'test/support/sinon/lib/sinon/spy.js',
            'test/support/sinon/lib/sinon/call.js',
            'test/support/sinon/lib/sinon/stub.js',
            'test/support/sinon/lib/sinon/mock.js',
            'test/support/sinon/lib/sinon/assert.js',
            'test/support/sinon/lib/sinon/collection.js',
            'test/support/sinon/lib/sinon/sandbox.js',
            'test/support/sinon/lib/sinon/test.js',
            'test/support/sinon/lib/sinon/test_case.js',
            'test/support/sinon-chai/lib/sinon-chai.js',
            'test/support/chai-jquery/chai-jquery.js',

            'src/attempt.js',
            'src/region.js',
            'src/view.js',
            'src/model_view.js',
            'src/collection_view.js',
            'src/computed.js',
            'src/model.js',
            'src/router.js',

            'test/test.js',
            'test/specs/*.js'
        ],

        preprocessors: {
            'src/*.js': ['6to5']
        },

        '6to5Preprocessor': {
            options: {
                sourceMap: 'inline',
                modules: 'ignore'
            },
            filename: function(file) {
                return file.originalPath.replace(/\.js$/, '.es5.js');
            },
            sourceFileName: function(file) {
                return file.originalPath;
            }
        },

        // list of files / patterns to exclude
        exclude: [],

        // web server port
        port: 8080,

        // level of logging
        // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
        logLevel: config.LOG_INFO,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        browsers: ['PhantomJS'],

        client: {
            mocha: {
                ui: 'bdd',
                slow: 10
            }
        },

        reportSlowerThan: 10
    });
};
