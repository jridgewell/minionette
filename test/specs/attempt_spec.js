describe("#attempt()", function() {
    it("does not error if object is undefined", function() {
        var ret = attempt(undefined, 'prop');

        expect(ret).to.equal(undefined);
    });

    it("does not error if object is null", function() {
        var ret = attempt(null, 'prop');

        expect(ret).to.equal(undefined);
    });

    it("sets the context of the method to the object", function() {
        var spy = sinon.spy(),
        obj = {method: spy};
        attempt(obj, 'method');

        expect(spy).to.have.been.calledOn(obj);
    });

    it("returns the output of the method", function() {
        var unique = _.uniqueId();
        var obj = {method: function() { return unique; }};
        var ret = attempt(obj, 'method');

        expect(ret).to.equal(unique);
    });

    it("passes the args param as arguments to the method", function() {
        var spy = sinon.spy(),
        obj = {method: spy};
        attempt(obj, 'method', [1, 2, 3]);

        expect(spy).to.have.been.calledWithExactly(1, 2, 3);
    });

    it("passes the args param as argument to the method", function() {
        var spy = sinon.spy(),
        obj = {method: spy};
        attempt(obj, 'method', 1);

        expect(spy).to.have.been.calledWithExactly(1);
    });

    it("can be forced to call function by passing `precheck`", function() {
        obj = {};
        expect(function() { attempt(obj, 'method', [], true); }).to.throw(TypeError);
    });
});
