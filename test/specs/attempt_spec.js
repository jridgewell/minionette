describe("#attempt()", function() {
    it("returns undefined if object is undefined", function() {
        var ret = attempt(undefined, 'prop');

        expect(ret).to.equal(undefined);
    });

    it("returns undefined if object is null", function() {
        var ret = attempt(null, 'prop');

        expect(ret).to.equal(undefined);
    });

    it("returns property if 'prop' is not a method", function() {
        var ret = attempt({prop: true}, 'prop');

        expect(ret).to.equal(true);
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

    it("passes the everything but the first two params as arguments to the method", function() {
        var spy = sinon.spy(),
        obj = {method: spy};
        attempt(obj, 'method', 1, 2, 3);

        expect(spy).to.have.been.calledWithExactly(1, 2, 3);
    });
});
