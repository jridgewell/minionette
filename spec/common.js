define(function(require) {
    window.$ = window.jQuery = require('jquery');
    window.chai              = require('chai');
    window.sinon             = require('sinon');
    window.sinonChai         = require('sinon-chai');
    window.jqueryChai        = require('chai-jquery');
    window.Minionette        = require('minionette');

    window.expect = chai.expect;
    window.assert = chai.assert;
    chai.should();
    chai.use(sinonChai);
    chai.use(jqueryChai);

    return window;
});
