var Minionette = Backbone.Minionette = {};
var sandbox;
var _sinon = sinon;

// Make sinon clean itself
beforeEach(function() {
    sandbox = sinon.sandbox.create();
    sinon = sandbox;
});
afterEach(function(){
    sinon = _sinon;
    sandbox.restore();
});

