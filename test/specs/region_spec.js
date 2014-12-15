describe('Minionette.Region', function() {
    var RegionView = Minionette.View.extend({
        template: _.template('<p>test</p><%= view("region") %><p>test</p>')
    });
    var view, parentView, region;
    beforeEach(function() {
        view = new RegionView();
        parentView = new RegionView();
        region = parentView.addRegion('region', view);
    });

    describe("instantiated with options", function() {
        var newView, expectedIndex;
        beforeEach(function() {
            newView = new Minionette.View();
        });

        it("falsey view", function() {
            region = view.addRegion('region', false);
            view.render();
            expectedIndex = region.view.$el.index();

            view.region.attach(newView);

            expect(newView.$el.index()).to.equal(expectedIndex);
            expect(expectedIndex).to.be.above(-1);
        });

        it("real view", function() {
            region = view.addRegion('region', new Minionette.View());
            view.render();
            expectedIndex = region.view.$el.index();

            view.region.attach(newView);

            expect(newView.$el.index()).to.equal(expectedIndex);
            expect(expectedIndex).to.be.above(-1);
        });

        it("selector", function() {
            region = view.addRegion('test', ':first-child');
            view.render();
            expectedIndex = region.view.$el.index();

            view.test.attach(newView);

            expect(newView.$el.index()).to.equal(expectedIndex);
            expect(expectedIndex).to.be.above(-1);
        });

        it("jQuery object", function() {
            region = view.addRegion('test', view.$(':first-child'));
            view.render();
            expectedIndex = region.view.$el.index();

            view.test.attach(newView);

            expect(newView.$el.index()).to.equal(expectedIndex);
            expect(expectedIndex).to.be.above(-1);
        });
    });

    describe("#_ensureView()", function() {
        it("sets #view to a passed in view", function() {
            expect(region.view).to.equal(view);
        });

        it("sets #view to a #_view if one is not passed in", function() {
            region = new Minionette.Region();

            expect(region.view).to.equal(region._view);
        });

        it("sets #view to #_view if passed in view is falsey", function() {
            region = view.addRegion('region', null);

            expect(region.view).to.equal(region._view);
        });

        it("sets #_view to the matched element if passed in view is a selector", function() {
            var selector = ':first-child';
            view.render();
            region = view.addRegion('region', selector);

            expect(region._view.$el).to.match(selector);
        });

        it("sets #_view to the matched element if passed in view is a jQuery object", function() {
            view.render();
            var $selector = view.$(':first-child');
            region = view.addRegion('region', $selector);

            expect(region._view.$el).to.match($selector);
        });
    });

    describe("#render()", function() {
        it("calls #view#render()", function() {
            var stub = sinon.stub(view, 'render');

            region.render();

            expect(stub).to.have.been.called;
        });

        it("returns #view#render()", function() {
            var expected = _.uniqueId();
            view.render = function() {
                return expected;
            };

            var ret = region.render();

            expect(ret).to.equal(expected);
        });
    });

    describe("#attach()", function() {
        var newView;
        beforeEach(function() {
            newView = new Minionette.View();
        });

        it("removes old #_detachedView if it exists", function() {
            var spy = sinon.spy(view, 'remove');
            region.detach();

            region.attach(newView);

            expect(spy).to.have.been.called;
        });

        it("replaces current view#el with newView#el (the same index in parent)", function() {
            parentView.render();
            view.render();
            var expectedIndex = view.$el.index();

            region.attach(newView);

            expect(newView.$el.index()).to.equal(expectedIndex);
            expect(expectedIndex).to.not.equal(-1);
        });

        it("calls #remove on old #view", function() {
            var spy = sinon.spy(view, 'remove');

            region.attach(newView);

            expect(spy).to.have.been.called;
        });

        it("sets #view to newView", function() {
            region.attach(newView);

            expect(region.view).to.equal(newView);
        });

        it("returns the region", function() {
            var ret = region.attach(newView);

            expect(ret).to.equal(region);
        });

        it("will correctly render even when not rendered and initialized with selector", function() {
            var selector = ':first-child';
            view.addRegion('region', selector);
            view.region.attach(newView);

            view.render();

            var expectedIndex = view.$(selector).index();
            expect(newView.$el.index()).to.equal(expectedIndex);
            expect(expectedIndex).to.not.equal(-1);
        });

        it("will correctly render even when not rendered and initialized with jQuery object", function() {
            var selector = ':first-child',
                $selector = view.$(selector);
            view.addRegion('region', $selector);
            view.region.attach(newView);


            view.render();

            var expectedIndex = view.$(selector).index();
            expect(newView.$el.index()).to.equal(expectedIndex);
            expect(expectedIndex).to.not.equal(-1);
        });

        it("triggers 'attach' event", function() {
            var spy = sinon.spy();
            region.on('attach', spy);

            region.attach(newView);

            expect(spy).to.have.been.calledWith(newView, region);
        });

        it("triggers 'attached' event", function() {
            var spy = sinon.spy();
            region.on('attached', spy);

            region.attach(newView);

            expect(spy).to.have.been.calledWith(newView, region);
        });

        it("triggers 'attach' event before setting #view", function() {
            var view = region.view;
            region.on('attach', function() {
                expect(region.view).to.equal(view);
            });

            region.attach(newView);
        });

        it("triggers 'attached' event after setting #view", function() {
            var view = region.view;
            region.on('attached', function() {
                expect(region.view).not.to.equal(view);
            });

            region.attach(newView);
        });

        it("triggers 'attach' before any DOM manipulations", function() {
            parentView.render();
            region.on('attach', function() {
                expect(parentView.$el).to.have(view.$el);
                expect(parentView.$el).not.to.have(newView.$el);
            });

            region.attach(newView);
        });

        it("triggers 'attached' after any DOM manipulations", function() {
            parentView.render();
            region.on('attached', function() {
                expect(parentView.$el).not.to.have(view.$el);
                expect(parentView.$el).to.have(newView.$el);
            });

            region.attach(newView);
        });

        it("triggers 'detach' event", function() {
            var spy = sinon.spy();
            region.on('detach', spy);

            region.attach(newView);

            expect(spy).to.have.been.calledWith(view, region);
        });

        it("triggers 'detached' event", function() {
            var spy = sinon.spy();
            region.on('detached', spy);

            region.attach(newView);

            expect(spy).to.have.been.calledWith(view, region);
        });

        it("triggers 'detach' before any DOM manipulations", function() {
            parentView.render();
            region.on('detach', function() {
                expect(parentView.$el).to.have(view.$el);
                expect(parentView.$el).not.to.have(newView.$el);
            });

            region.attach(newView);
        });

        it("triggers 'detached' after any DOM manipulations", function() {
            parentView.render();
            region.on('detached', function() {
                expect(parentView.$el).not.to.have(view.$el);
                expect(parentView.$el).to.have(newView.$el);
            });

            region.attach(newView);
        });

        it("triggers 'detach' event before setting #view", function() {
            var view = region.view;
            region.on('detach', function() {
                expect(region.view).to.equal(view);
            });

            region.attach(newView);
        });

        it("triggers 'detached' event after setting #view", function() {
            var view = region.view;
            region.on('detached', function() {
                expect(region.view).not.to.equal(view);
            });

            region.attach(newView);
        });

        it("will not cause view to become detached", function() {
            parentView.render();
            var view = region.view;
            var expectedIndex = view.$el.index();

            region.attach(view);

            expect(region.view).to.equal(view);
            expect(view.$el.index()).to.equal(expectedIndex);
        });
    });

    describe("#detach()", function() {
        it("sets #_detachedView to the old #view", function() {
            var oldView = region.view;

            region.detach();

            expect(region._detachedView).to.equal(oldView);
        });

        it("doesn't leak a previous #_detachedView", function() {
            var oldView = region.view;

            region.detach();
            region.detach();

            expect(region._detachedView).to.equal(oldView);
        });

        it("sets #view to #_view", function() {
            region.detach();

            expect(region.view).to.equal(region._view);
        });

        it("doesn't detach #_view", function() {
            region.detach();
            region.detach();

            expect(region._detachedView).to.not.equal(region._view);
        });

        it("replaces current view#el with _view#el (the same index in parent)", function() {
            view.render();
            parentView.render();
            var expectedIndex = view.$el.index();

            region.detach();

            expect(region._view.$el.index()).to.equal(expectedIndex);
            expect(expectedIndex).to.not.equal(-1);
        });

        it("doesn't remove events on view", function() {
            var spy = sinon.spy();
            view.on('click', spy);

            region.detach();
            view.trigger('click');

            expect(spy).to.have.been.called;
        });

        it("returns this for chaining", function() {
            var ret = region.detach();

            expect(ret).to.equal(region);
        });

        it("triggers 'detach' event", function() {
            var spy = sinon.spy();
            region.on('detach', spy);

            region.detach();

            expect(spy).to.have.been.calledWith(view, region);
        });

        it("triggers 'detached' event", function() {
            var spy = sinon.spy();
            region.on('detached', spy);

            region.detach();

            expect(spy).to.have.been.calledWith(view, region);
        });

        it("triggers 'detach' before any DOM manipulations", function() {
            parentView.render();
            var view = region.view;

            region.on('detach', function() {
                expect(parentView.$el).to.have(view.$el);
            });

            region.detach();
        });

        it("triggers 'detached' after any DOM manipulations", function() {
            parentView.render();
            var view = region.view;

            region.on('detached', function() {
                expect(parentView.$el).not.to.have(view.$el);
            });

            region.detach();
        });

        it("triggers 'detach' event before setting #view", function() {
            var view = region.view;
            region.on('detach', function() {
                expect(region.view).to.equal(view);
            });

            region.detach();
        });

        it("triggers 'detached' event after setting #view", function() {
            var view = region.view;
            region.on('detached', function() {
                expect(region.view).not.to.equal(view);
            });

            region.detach();
        });
    });

    describe("#reattach()", function() {
        beforeEach(function() {
            parentView.render();
            region.detach();
        });

        it("scopes #reattach() to _parent", function() {
            parentView.$el.detach(); // Make sure parentView isn't in the document.body
            var expectedIndex = region.view.$el.index();

            region.reattach();

            expect(view.$el.index()).to.equal(expectedIndex);
            expect(expectedIndex).to.not.equal(-1);
        });

        it("replaces view#el with _detachedView#el", function() {
            var expectedIndex = region.view.$el.index();

            region.reattach();

            expect(view.$el.index()).to.equal(expectedIndex);
            expect(expectedIndex).to.not.equal(-1);
        });

        it("deletes #_detachedView so it can't be re#attach()ed", function() {
            region.reattach();

            expect(region._detachedView).to.not.exist;
        });

        it("will not cause #_view to become detached", function() {
            region.reattach();
            expect(region.view).to.equal(view);
            region.reattach();
            expect(region.view).to.equal(view);
            region.reattach();
            expect(region.view).to.equal(view);
            region.reattach();
            expect(region.view).to.equal(view);

            expect(region.view.$el.parent()).to.exist;
        });

        it("will reattach even when initialized with selector and never bound #_view to element", function() {
            var selector = ':first-child';
            view.addRegion('region', selector);
            view.$el.html(view.template(view._serialize()));

            var expectedIndex = view.$(selector).index();

            view.region.reattach();

            expect(view.region.view.$el.index()).to.equal(expectedIndex);
            expect(expectedIndex).to.not.equal(-1);
        });

        it("triggers 'reattach' event", function() {
            var spy = sinon.spy();
            region.on('reattach', spy);

            region.reattach();

            expect(spy).to.have.been.calledWith(view, region);
        });

        it("triggers 'reattached' event", function() {
            var spy = sinon.spy();
            region.on('reattached', spy);

            region.reattach();

            expect(spy).to.have.been.calledWith(view, region);
        });

        it("triggers 'reattach' before any DOM manipulations", function() {
            var view = region.view;

            region.on('reattach', function() {
                expect(parentView.$el).to.have(view.$el);
            });

            region.reattach();
        });

        it("triggers 'reattached' after any DOM manipulations", function() {
            var view = region.view;

            region.on('reattached', function() {
                expect(parentView.$el).not.to.have(view.$el);
            });

            region.reattach();
        });

        it("triggers 'reattach' event before setting #view", function() {
            var view = region.view;
            region.on('reattach', function() {
                expect(region.view).to.equal(view);
            });

            region.reattach();
        });

        it("triggers 'reattached' event after setting #view", function() {
            var view = region.view;
            region.on('reattached', function() {
                expect(region.view).not.to.equal(view);
            });

            region.reattach();
        });
    });

    describe("#remove()", function() {
        it("triggers 'remove' event", function() {
            var spy = sinon.spy();
            region.on('remove', spy);

            region.remove();

            expect(spy).to.have.been.calledWith(region);
        });

        it("triggers 'removed' event", function() {
            var spy = sinon.spy();
            region.on('removed', spy);

            region.remove();

            expect(spy).to.have.been.calledWith(region);
        });

        it("triggers 'remove' before any DOM manipulations", function() {
            parentView.render();
            var view = region.view;

            region.on('remove', function() {
                expect(parentView.$el).to.have(view.$el);
            });

            region.remove();
        });

        it("triggers 'removeed' after any DOM manipulations", function() {
            parentView.render();
            var view = region.view;

            region.on('removeed', function() {
                expect(parentView.$el).not.to.have(view.$el);
            });

            region.remove();
        });

        it("calls #view#remove()", function() {
            var spy = sinon.spy(view, 'remove');

            region.remove();

            expect(spy).to.have.been.called;
        });

        it("calls #_view#remove()", function() {
            region.attach(new Minionette.View());
            var spy = sinon.spy(region._view, 'remove');

            region.remove();

            expect(spy).to.have.been.called;
        });

        it("calls #_detachedView#remove(), if it exists", function() {
            var spy = sinon.spy(region.view, 'remove');
            region.detach();

            region.remove();

            expect(spy).to.have.been.called;
        });

        it("calls #stopListening", function() {
            var spy = sinon.spy(region, 'stopListening');

            region.remove();

            expect(spy).to.have.been.called;
        });

        it("removes itself from it's parent", function() {
            region.remove();

            expect(parentView.region).to.not.exist;
        });

        it("returns the region", function() {
            var ret = region.remove();

            expect(ret).to.equal(region);
        });
    });

    describe("#reset()", function() {
        it("replaces view#el with _view#el", function() {
            parentView.render();
            var expectedIndex = view.$el.index();

            region.reset();

            expect(region._view.$el.index()).to.equal(expectedIndex);
            expect(expectedIndex).to.not.equal(-1);
        });

        it("calls #remove on old #view", function() {
            var spy = sinon.spy(view, 'remove');

            region.reset();

            expect(spy).to.have.been.called;
        });

        it("returns the region", function() {
            var ret = region.reset();

            expect(ret).to.equal(region);
        });
    });

    describe("#_removeView()", function() {
        it("sets #view to #_view", function() {
            region._removeView(view);

            expect(region.view).to.equal(region._view);
        });

        it("replaces view#el with _view#el", function() {
            parentView.render();
            var expectedIndex = view.$el.index();

            region.reset();

            expect(region._view.$el.index()).to.equal(expectedIndex);
            expect(expectedIndex).to.not.equal(-1);
        });

        it("only resets if #view equals passed in view", function() {
            var v = new Minionette.View();

            region._removeView(v);

            expect(region.view).to.equal(view);
        });
    });
});
