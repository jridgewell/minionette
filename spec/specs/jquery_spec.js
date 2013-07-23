define(function() {
    describe('jQuery Remove Polyfill', function() {
        beforeEach(function() {
            this.element = $('<div />');
        });
        afterEach(function() {
            this.element.remove();
        });

        describe("when not nested", function() {
            beforeEach(function() {
                this.spy = this.sinon.spy();
                this.element.on('remove', this.spy);
            });

            describe("when on the page", function() {
                it("triggers on jQuery#remove", function() {
                    $(document.body).append(this.element);

                    this.element.remove();

                    expect(this.spy).to.have.been.called;
                });
            });

            describe("when not on the page", function() {
                it("triggers on jQuery#remove", function() {
                    this.element.remove();

                    expect(this.spy).to.have.been.called;
                });
            });

            it("doesn't trigger on jQuery#off", function() {
                this.element.off('remove');

                expect(this.spy).to.not.have.been.called;
            });
        });

        describe("when nested", function() {
            beforeEach(function() {
                this.spy = this.sinon.spy();
                this.nestedElement = $('<div />');
                this.element.append(this.nestedElement);
                this.nestedElement.on('remove', this.spy);
            });

            describe("when on the page", function() {
                it("triggers on jQuery#remove on parent element", function() {
                    $(document.body).append(this.element);

                    this.element.remove();

                    expect(this.spy).to.have.been.called;
                });

                it("triggers on jQuery#html on parent element", function() {
                    $(document.body).append(this.element);

                    this.element.html('');

                    expect(this.spy).to.have.been.called;
                });
            });

            describe("when not on the page", function() {
                it("triggers on jQuery#remove on parent element", function() {
                    this.element.remove();

                    expect(this.spy).to.have.been.called;
                });

                it("triggers on jQuery#html on parent element", function() {
                    this.element.html('');

                    expect(this.spy).to.have.been.called;
                });
            });
        });
    });
});
