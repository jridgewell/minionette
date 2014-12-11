var Minionette = Backbone.Minionette = {
    Region: Region,
    Model: Model,
    Computed: Computed,
    Router: Router,
    View: View,
    ModelView: ModelView,
    CollectionView: CollectionView
};
var sandbox;
var _sinon = sinon;
var expect = chai.expect;

// Make sinon clean itself
beforeEach(function() {
    sandbox = sinon.sandbox.create();
    sinon = sandbox;
});
afterEach(function(){
    sinon = _sinon;
    sandbox.restore();
});

