define(function() {
    describe('jQuery Remove Polyfill', function() {
        beforeEach(function() {
            this.element = $('<div />');
        });
        beforeEach(function() {
            this.spy = this.sinon.spy();
            this.element.on('remove', this.spy);
        });

        it("triggers on jQuery#remove when not on the page", function() {
            this.element.remove();

            expect(this.spy).to.have.been.called;
        });

        it("triggers on jQuery#remove when on the page", function() {
            $(document.body).append(this.element);

            this.element.remove();

            expect(this.spy).to.have.been.called;
        });

        it("doesn't trigger on jQuery#off", function() {
            this.element.off('remove');

            expect(this.spy).to.not.have.been.called;
        });
    });
});
