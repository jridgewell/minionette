// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html
var minimist = require('minimist');

var opts = minimist(process.argv.slice(2));

module.exports = function(config) {
    var conf = {
        // base path, that will be used to resolve files and exclude
        basePath: '',

        // testing framework to use (jasmine/mocha/qunit/...)
        frameworks: ['mocha', 'sinon', 'chai'],

        reporters: ['dots'],

        // list of files / patterns to load in the browser
        files: [
            'test/support/jquery/dist/jquery.js',
            'test/support/underscore/underscore.js',
            'test/support/backbone/backbone.js',
            'test/support/sinon-chai/lib/sinon-chai.js',
            'test/support/chai-jquery/chai-jquery.js',
            'test/*.js',

            'src/attempt.js',
            'src/region.js',
            'src/view.js',
            'src/model_view.js',
            'src/collection_view.js',
            'src/computed.js',
            'src/model.js',
            'src/router.js',
            'src/trigger.js',

            'test/specs/*.js'
        ],

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
    };

    if (opts.coverage) {
        conf.reporters.push('coverage');

        conf.preprocessors = conf.preprocessors || {};
        var covPre = conf.preprocessors['src/*.js'] || [];
        covPre.push('coverage');
        conf.preprocessors['src/*.js'] = covPre;

        conf.coverageReporter = {
            dir: 'coverage',
            subdir: '.',
            type: 'lcov'
        };
    }

    config.set(conf);
};
