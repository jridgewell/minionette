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
            it("sets #view to a new #_View if one is not passed in", function() {
                var region = new Minionette.Region();

                expect(region.view).to.be.instanceOf(region._View)
            });

            it("sets #view to a new #_View if passed in view isn't an instanceof Backbone.View", function() {
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

            it("calls #view#$el#after()", function() {
                var spy = this.sinon.spy(this.view.$el, 'after');

                this.region.attach(this.newView);

                expect(spy).to.have.been.calledWith(this.newView.$el);
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
            it("sets #_detachedView to the old #view", function() {
                var v = this.region.view;

                this.region.detach();

                expect(this.region._detachedView).to.equal(v);
            });

            it("sets #view to a new #_View", function() {
                this.region.detach();

                expect(this.region.view).to.be.instanceOf(this.region._View)
            });

            it("appends the new #view after the old #view", function() {
                var spy = this.sinon.spy(this.region.view.$el, 'after');

                this.region.detach();

                expect(spy).to.have.been.calledWith(this.region.view.$el);
            });

            it("calls #view#$el#detach()", function() {
                var spy = this.sinon.spy(this.region.view.$el, 'detach');

                this.region.detach();

                expect(spy).to.have.been.called;
            });

            it("returns this for chaining", function() {
                var ret = this.region.detach();

                expect(ret).to.equal(this.region);
            });
        });

        describe("#reattach()", function() {
            beforeEach(function() {
                this.region.detach();
            });
            it("calls #attach() with #_detachedView", function() {
                var spy = this.sinon.spy(this.region, 'attach');

                this.region.reattach();

                expect(spy).to.have.been.calledWith(this.view);
            });

            it("delete #_detachedView so it can't be re#attach()ed", function() {
                this.region.reattach();

                expect(this.region._detachedView).to.not.be.defined;
            });
        });

        describe("#remove()", function() {
            it("calls #view#remove()", function() {
                var spy = this.sinon.spy(this.view, 'remove');

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
