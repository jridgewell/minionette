define(function() {
    describe('Minionette.Region', function() {
        beforeEach(function() {
            this.view = new Minionette.View();
            this.region = new Minionette.Region({view: this.view});
        });

        describe("#_configure()", function() {
            it("picks view out of initialization options", function() {
                var view = new Backbone.View(),
                    region = new Minionette.Region({view: view})

                expect(region.view).to.equal(view);
            });
        });

        describe("#_ensureView()", function() {
            it("sets #view to #_view if one is not passed in", function() {
                var region = new Minionette.Region();

                expect(region.view).to.be.instanceOf(region._View)
            });

            it("sets #view to #_view if passed in view isn't an instanceof Backbone.View", function() {
                var region = new Minionette.Region({view: null});

                expect(region.view).to.be.instanceOf(region._View)
            });
        });

        describe("#render()", function() {
            it("calls #view#render()", function() {
                var spy = this.sinon.spy(this.view, 'render');

                this.region.render();

                expect(this.spy).to.have.been.called;
            });

            it("returns #view#render()", function() {
                var expected = _.uniqueId();
                this.view.render = function() {
                    return expected;
                };

                var ret = this.region.render();

                expect(ret).to.equal(expected);
            });
        });

        describe("#attach()", function() {
            beforeEach(function() {
                this.newView = new Minionette.View();
            });

            it("calls #view#$el#replaceWith()", function() {
                var spy = this.sinon.spy(this.view.$el, 'replaceWith');

                this.region.attach(this.newView);

                expect(spy).to.have.been.calledWith(this.newView.el);
            });

            it("calls #view#remove()", function() {
                var spy = this.sinon.spy(this.view, 'remove');

                this.region.attach(this.newView);

                expect(spy).to.have.been.called;
            });

            it("sets #view to newView", function() {
                this.region.attach(this.newView);

                expect(this.region.view).to.equal(this.newView);
            });

            it("returns newView", function() {
                var ret = this.region.attach(this.newView);

                expect(ret).to.equal(this.newView);
            });
        });

        describe("#detach()", function() {
            xit("calls ")
        });

        describe("#remove()", function() {
            it("calls #view#remove()", function() {
                var spy = this.sinon.spy(this.view, 'remove');

                this.region.remove();

                expect(spy).to.have.been.called;
            });

            it("calls #view#$el#replaceWith()", function() {
                var spy = this.sinon.spy(this.view.$el, 'replaceWith');

                this.region.remove();

                expect(spy).to.have.been.called;
            });


            it("replaces #view with empty element", function() {
                this.region.remove();

                expect(this.region.view.$el).to.be.empty;
            });

            it("returns removedView", function() {
                var ret = this.region.remove();

                expect(ret).to.equal(this.view);
            });
        });
    });
});
