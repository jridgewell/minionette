define(function() {
    describe('Minionette.Region', function() {
        var RegionView = Minionette.View.extend({
            template: _.template('<p>test</p><%= view("region") %><p>test</p>')
        });
        function addInnerView(name, parentView) {
            var v = new Minionette.View({tagName: 'p'});
            v.template = _.template("inner");
            v.render();
            parentView.addRegion(name, v);
            parentView.render();
            return v;
        }
        beforeEach(function() {
            this.view = new RegionView();
            this.region = new Minionette.Region({view: this.view});
        });
        afterEach(function() {
            this.region.remove();
            delete this.view;
            delete this.region;
        });

        describe("#_configure()", function() {
            it("picks view out of initialization options", function() {
                expect(this.region.view).to.equal(this.view);
            });
        });

        describe("#_ensureView()", function() {
            it("sets #view to a #_view if one is not passed in", function() {
                var region = new Minionette.Region();

                expect(region.view).to.equal(region._view);

                region.remove();
            });

            it("sets #view to #_view if passed in view is falsey", function() {
                var region = new Minionette.Region({view: null});

                expect(region.view).to.equal(region._view);

                region.remove();
            });

            it("sets #_view to the matched element if passed in view is a selector", function() {
                var selector = ':first-child'
                this.view.addRegion('region', selector);

                expect(this.view.region._view.el).to.equal(this.view.$(selector)[0])
            });
        });

        describe("#render()", function() {
            it("calls #view#render()", function() {
                var stub = this.sinon.stub(this.view, 'render');

                this.region.render();

                expect(stub).to.have.been.called;
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
            afterEach(function() {
                delete this.newView;
            });

            it("removes old #_detachedView if it exists", function() {
                var v = addInnerView('region', this.view),
                    spy = this.sinon.spy(v, 'remove');
                this.region.detach();

                this.view.region.attach(this.newView);

                expect(spy).to.have.been.called;
            });

            it("replaces current view#el with newView#el (the same index in parent)", function() {
                var v = addInnerView('region', this.view),
                    expectedIndex = v.$el.index();

                this.view.region.attach(this.newView);

                expect(this.newView.$el.index()).to.equal(expectedIndex);
            });

            it("calls #remove on old #view", function() {
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

            it("will correctly render even when not rendered and initialized with selector", function() {
                var selector = ':first-child';
                this.view.addRegion('region', selector);
                this.view.region.attach(this.newView);

                this.view.render();

                var expectedIndex = this.view.$(selector).index();
                expect(this.newView.$el.index()).to.equal(expectedIndex);
            });
        });

        describe("#detach()", function() {
            it("sets #_detachedView to the old #view", function() {
                var oldView = this.region.view;

                this.region.detach();

                expect(this.region._detachedView).to.equal(oldView);
            });

            it("sets #view to #_view", function() {
                this.region.detach();

                expect(this.region.view).to.equal(this.region._view);
            });

            it("replaces current view#el with _view#el (the same index in parent)", function() {
                var v = addInnerView('region', this.view),
                    expectedIndex = v.$el.index();

                this.view.region.detach();

                expect(this.view.region._view.$el.index()).to.equal(expectedIndex);
            });

            it("doesn't remove events on view", function() {
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

            it("scopes #reattach() to _parent", function() {
                this.view.$el.detach(); // Make sure view isn't in the document.body
                var v = addInnerView('region', this.view);
                this.view.region.detach();

                var expectedIndex = this.view.region.view.$el.index();

                this.view.region.reattach();

                expect(v.$el.index()).to.equal(expectedIndex);
            });

            it("replaces view#el with _detachedView#el", function() {
                var v = addInnerView('region', this.view);
                this.view.region.detach();

                var expectedIndex = this.view.region.view.$el.index();

                this.view.region.reattach();

                expect(v.$el.index()).to.equal(expectedIndex);
            });

            it("deletes #_detachedView so it can't be re#attach()ed", function() {
                this.region.reattach();

                expect(this.region._detachedView).to.not.exist;
            });

            it("will reattach even when initialized with selector and never bound #_view to element", function() {
                var selector = ':first-child';
                this.view.addRegion('region', selector);
                this.view.render();

                var expectedIndex = this.view.$(selector).index();

                this.view.region.reattach();

                expect(this.view.region.view.$el.index()).to.equal(expectedIndex);
            });
        });

        describe("#remove()", function() {
            it("triggers the 'remove' event", function() {
                var spy = this.sinon.spy();
                this.region.on('remove', spy);

                this.region.remove();

                expect(spy).to.have.been.called;
            });

            it("calls #view#remove()", function() {
                var spy = this.sinon.spy(this.view, 'remove');

                this.region.remove();

                expect(spy).to.have.been.called;
            });

            it("calls #_view#remove()", function() {
                this.region.attach(new Minionette.View());
                var spy = this.sinon.spy(this.region._view, 'remove');

                this.region.remove();

                expect(spy).to.have.been.called;
            });

            it("calls #_detachedView#remove(), if it exists", function() {
                var spy = this.sinon.spy(this.region.view, 'remove');
                this.region.detach();

                this.region.remove();

                expect(spy).to.have.been.called;
            });

            it("calls #stopListening", function() {
                var spy = this.sinon.spy(this.region, 'stopListening');

                this.region.remove();

                expect(spy).to.have.been.called;
            });

            it("removes itself from it's parent", function() {
                addInnerView('region', this.view);

                this.view.region.remove();

                expect(this.view.region).to.not.exist;
            });
        });

        describe("#reset()", function() {
            it("replaces view#el with _view#el", function() {
                var v = addInnerView('region', this.view),
                    expectedIndex = v.$el.index();

                this.view.region.reset();

                expect(this.view.region._view.$el.index()).to.equal(expectedIndex);
            });

            it("calls #remove on old #view", function() {
                var spy = this.sinon.spy(this.view, 'remove');

                this.region.reset();

                expect(spy).to.have.been.called;
            });
        });

        describe("#_removeView()", function() {
            it("sets #view to #_view", function() {
                this.region._removeView(this.view);

                expect(this.region.view).to.equal(this.region._view);
            });

            it("replaces view#el with _view#el", function() {
                var v = addInnerView('region', this.view),
                    expectedIndex = v.$el.index();

                this.view.region.reset();

                expect(this.view.region._view.$el.index()).to.equal(expectedIndex);
            });

            it("only resets if #view equals passed in view", function() {
                var v = new Minionette.View();

                this.region._removeView(v);

                expect(this.region.view).to.equal(this.view);
            });
        });
    });
});
