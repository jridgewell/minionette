require.config({
    // Base URL relative to the test runner
    // Paths are relative to this
    paths: {
        // Testing libs
        'common'        : 'common',
        'chai'          : 'support/chai/chai',
        'sinon'         : 'support/sinon/lib/sinon',
        'sinon-chai'    : 'support/sinon-chai/lib/sinon-chai',
        'chai-jquery'   : 'support/chai-jquery/chai-jquery',
        'jquery'        : 'support/jquery/jquery',
        'underscore'    : 'support/underscore/underscore',
        'backbone'      : 'support/backbone/backbone',
        'minionette'    : '../dist/amd/minionette'
    },
    shim: {
        underscore: {
            exports: '_'
        },
        jquery: {
            exports: 'jQuery'
        },
        backbone: {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        mocha: {
            exports: 'mocha'
        },
        sinon: {
            exports: 'sinon'
        }
    },
    priority: [
        'common',
        'jquery',
        'underscore'
    ]
});

// Protect from barfs
console = window.console || function() {};

mocha.setup('bdd');
function runMocha() {
    mocha.run();
}
