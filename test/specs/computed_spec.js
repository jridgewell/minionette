describe('Minionette.Computed()', function() {
    var fn;
    beforeEach(function() {
        fn = function() {};
    });

    it('returns the computing function', function() {
        var computed = Minionette.Computed('1', '2', fn);
        expect(computed).to.be(fn);
    });

    it('sets initial params as the dependencies', function() {
        var computed = Minionette.Computed('1', '2', fn);
        expect(computed._dependentKeys).to.deep.equal(['1', '2']);
    });

    it('throws TypeError if any dependencies are not strings', function() {
        expect(function() { Minionette.Computed({}, fn); }).to.throw(TypeError);
    });

    it('throws TypeError if computing function is not a function', function() {
        expect(function() { Minionette.Computed('1', '2', {}); }).to.throw(TypeError);
    });
});
