define(function() {
    describe('Minionette.SubView', function() {
        beforeEach(function() {
            this.view = new Minionette.View();
            this.subView = new Minionette.SubView({view: this.view});
        });

        it("creates #initialize()", function() {
            expect(this.subView.initialize).to.be.defined;
            expect(this.subView.initialize()).to.not.be.defined;
        });

        it("creates #_view as an empty Backbone.View", function() {
            expect(this.subView._view.render().$el).to.be.empty;
        });

        describe("#_configure()", function() {
            it("picks view out of initialization options", function() {
                var view = new Backbone.View(),
                    subView = new Minionette.SubView({view: view})

                expect(subView.view).to.equal(view);
            });
        });

        describe("#_ensureView()", function() {
            it("sets #view to #_view if one is not passed in", function() {
                var subView = new Minionette.SubView();

                expect(subView.view).to.equal(subView._view);
            });

            it("sets #view to #_view if passed in view isn't an instanceof Backbone.View", function() {
                var subView = new Minionette.SubView({view: null});

                expect(subView.view).to.equal(subView._view);
            });
        });

        describe("#render()", function() {
            it("calls #view#render()", function() {
                var spy = this.sinon.spy(this.view, 'render');

                this.subView.render();

                expect(this.spy).to.have.been.called;
            });

            it("returns #view#render()", function() {
                var expected = _.uniqueId();
                this.view.render = function() {
                    return expected;
                };

                var ret = this.subView.render();

                expect(ret).to.equal(expected);
            });
        });

        describe("#attach()", function() {
            beforeEach(function() {
                this.newView = new Minionette.View();
            });

            it("calls #view#$el#replaceWith()", function() {
                var spy = this.sinon.spy(this.view.$el, 'replaceWith');

                this.subView.attach(this.newView);

                expect(spy).to.have.been.calledWith(this.newView.el);
            });

            it("calls #view#remove()", function() {
                var spy = this.sinon.spy(this.view, 'remove');

                this.subView.attach(this.newView);

                expect(spy).to.have.been.called;
            });

            it("sets #view to newView", function() {
                this.subView.attach(this.newView);

                expect(this.subView.view).to.equal(this.newView);
            });

            it("returns newView", function() {
                var ret = this.subView.attach(this.newView);

                expect(ret).to.equal(this.newView);
            });
        });

        describe("#remove()", function() {
            it("calls #view#remove()", function() {
                var spy = this.sinon.spy(this.view, 'remove');

                this.subView.remove();

                expect(spy).to.have.been.called;
            });

            it("calls #view#$el#replaceWith()", function() {
                var spy = this.sinon.spy(this.view.$el, 'replaceWith');

                this.subView.remove();

                expect(spy).to.have.been.called;
            });


            it("replaces #view with empty element", function() {
                this.subView.remove();

                expect(this.subView.view.$el).to.be.empty;
            });

            it("returns removedView", function() {
                var ret = this.subView.remove();

                expect(ret).to.equal(this.view);
            });
        });
    });
});
