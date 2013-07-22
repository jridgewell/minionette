define(function() {
    describe('jQuery Remove Polyfill', function() {
        beforeEach(function() {
            this.element = $('<div />');
        });
        beforeEach(function() {
            this.spy = this.sinon.spy();
            this.element.on('remove', this.spy);
        });

        it("triggers when the event is unbound", function() {
            this.element.off('remove');

            expect(this.spy).to.have.been.called;
        });

        it("triggers when element is removed", function() {
            this.element.remove();

            expect(this.spy).to.have.been.called;
        });
    });
});
