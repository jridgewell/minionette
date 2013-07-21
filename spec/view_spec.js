define(function(require) {
    describe('Minionette.View', function() {
        it('Exists', function() {
            expect(Minionette.View).to.not.be.undefined;
        });

        it("calls Backbone.View's constructor", function() {
            var spy = Backbone.View = this.sinon.spy();

            new Minionette.View;

            spy.should.have.been.called;
        })
    });
});
