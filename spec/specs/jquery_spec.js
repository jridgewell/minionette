define(function() {
    describe('jQuery Remove Polyfill', function() {
        beforeEach(function() {
            this.element = $('<div />');
        });
        afterEach(function() {
            delete this.element;
        });

        it("doesn't trigger on jQuery#off()", function() {
            var spy = this.sinon.spy();
            this.element.on('remove', spy);

            this.element.off('remove');

            expect(spy).to.not.have.been.called;
        });

        it("doesn't trigger on jQuery#detach()", function() {
            var spy = this.sinon.spy();
            this.element.on('remove', spy);

            this.element.detach();

            expect(spy).to.not.have.been.called;
        });

        describe("when not nested", function() {
            beforeEach(function() {
                this.spy = this.sinon.spy();
                this.element.on('remove', this.spy);
            });
            afterEach(function() {
                delete this.spy;
            });

            it("triggers on jQuery#remove()", function() {
                this.element.remove();

                expect(this.spy).to.have.been.called;
            });
        });

        describe("when nested", function() {
            beforeEach(function() {
                this.spy = this.sinon.spy();
                this.nestedElement = $('<div />');
                this.element.append(this.nestedElement);
                this.nestedElement.on('remove', this.spy);
            });
            afterEach(function() {
                delete this.spy;
                delete this.nestedElement;
            });

            it("triggers on jQuery#remove() on parent element", function() {
                this.element.remove();

                expect(this.spy).to.have.been.called;
            });

            it("triggers on jQuery#html() on parent element", function() {
                this.element.html('');

                expect(this.spy).to.have.been.called;
            });
        });
    });
});
