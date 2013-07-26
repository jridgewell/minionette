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
            it("sets #view to a #_view if one is not passed in", function() {
                var region = new Minionette.Region();

                expect(region.view).to.equal(region._view);
            });

            it("sets #view to #_view if passed in view isn't an instanceof Backbone.View", function() {
                var region = new Minionette.Region({view: 'view?'});

                expect(region.view).to.equal(region._view);
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

            it("replaces current view#el with newView#el (the same index in parent)", function() {
                var v = new Minionette.View({tagName: 'p'});
                v.template = _.template("test")
                v.render();
                this.view.template = _.template('<p>test</p><%= view("region") %><p>test</p>')
                this.view.addRegion('region', v);
                this.view.render();

                var expectedIndex = v.$el.index();

                this.view.region.attach(this.newView);

                expect(this.newView.$el.index()).to.equal(expectedIndex);
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

            it("sets #view to #_view", function() {
                this.region.detach();

                expect(this.region.view).to.equal(this.region._view);
            });

            it("replaces current view#el with _view#el (the same index in parent)", function() {
                var v = new Minionette.View({tagName: 'p'});
                v.template = _.template("test")
                v.render();
                this.view.template = _.template('<p>test</p><%= view("region") %><p>test</p>')
                this.view.addRegion('region', v);
                this.view.render();

                var expectedIndex = v.$el.index();

                this.view.region.detach();

                expect(this.view.region.view.$el.index()).to.equal(expectedIndex);
            });

            it("calls #view#$el#detach()", function() {
                var spy = this.sinon.spy();
                this.view.on('click', spy);

                this.region.detach();
                this.view.trigger('click');

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

            xit("scopes #reattach() to _parent", function() {
            });

            it("replaces view#el with _detachedView#el", function() {
                var v = new Minionette.View({tagName: 'p'});
                v.template = _.template("test")
                v.render();
                this.view.template = _.template('<p>test</p><%= view("region") %><p>test</p>')
                this.view.addRegion('region', v);
                this.view.render();
                this.view.region.detach();

                var expectedIndex = this.view.region.view.$el.index();

                this.view.region.reattach();

                expect(v.$el.index()).to.equal(expectedIndex);
            });

            it("deletes #_detachedView so it can't be re#attach()ed", function() {
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

            it("replaces view#el with _view#el", function() {
                var v = new Minionette.View({tagName: 'p'});
                v.template = _.template("test")
                v.render();
                this.view.template = _.template('<p>test</p><%= view("region") %><p>test</p>')
                this.view.addRegion('region', v);
                this.view.render();

                var expectedIndex = this.view.region.view.$el.index();

                this.view.region.remove();

                expect(this.view.region.view.$el.index()).to.equal(expectedIndex);
            });

            it("returns removedView", function() {
                var ret = this.region.remove();

                expect(ret).to.equal(this.view);
            });
        });

        describe("#reset()", function() {
            it("replaces view#el with _view#el", function() {
                var v = new Minionette.View({tagName: 'p'});
                v.template = _.template("test")
                v.render();
                this.view.template = _.template('<p>test</p><%= view("region") %><p>test</p>')
                this.view.addRegion('region', v);
                this.view.render();

                var expectedIndex = this.view.region.view.$el.index();

                this.view.region.reset();

                expect(this.view.region.view.$el.index()).to.equal(expectedIndex);
            });

            it("doesn't call #remove on old #view", function() {
                var spy = this.sinon.spy(this.view, 'remove');

                this.region.reset();

                expect(spy).to.not.have.been.called;
            });
        });

        describe("#_removeView()", function() {
            it("sets #view to empty element", function() {
                this.region.reset(this.view);

                expect(this.region.view.$el).to.be.empty;
            });

            it("only resets if #view equals passed in view", function() {
                var v = new Minionette.View;

                this.region._removeView(v);

                expect(this.region.view).to.equal(this.view);
            });
        });
    });
});
