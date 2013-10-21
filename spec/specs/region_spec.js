describe('Minionette.Region', function() {
    var RegionView = Minionette.View.extend({
        template: _.template('<p>test</p><%= view("region") %><p>test</p>')
    });
    beforeEach(function() {
        this.view = new RegionView();
        this.parentView = new RegionView();
        this.region = this.parentView.addRegion('region', this.view);
    });
    afterEach(function() {
        delete this.view;
        delete this.parentView;
        delete this.region;
    });

    describe("constructor", function() {
        var name = 'name';
        it("sets #cid to name if passed in", function() {
            var region = new Minionette.Region({name: name});
            expect(region.cid).to.equal(name);
        });

        it("sets #cid to unique name if not", function() {
            var region = new Minionette.Region();
            expect(region.cid).to.not.equal(name);
        });
    });

    describe("instantiated with options", function() {
        beforeEach(function() {
            this.newView = new Minionette.View();
        });
        afterEach(function() {
            delete this.newView;
        });

        it("falsey view", function() {
            this.view.addRegion('region', false);
            this.view.render();
            var expectedIndex = this.view.region.view.$el.index();

            this.view.region.attach(this.newView);

            expect(this.newView.$el.index()).to.equal(expectedIndex);
            expect(expectedIndex).to.not.equal(-1);
        });

        it("real view", function() {
            this.view.addRegion('region', new Minionette.View());
            this.view.render();
            var expectedIndex = this.view.region.view.$el.index();

            this.view.region.attach(this.newView);

            expect(this.newView.$el.index()).to.equal(expectedIndex);
            expect(expectedIndex).to.not.equal(-1);
        });

        it("selector", function() {
            this.view.addRegion('test', ':first-child');
            this.view.render();
            var expectedIndex = this.view.test.view.$el.index();

            this.view.test.attach(this.newView);

            expect(this.newView.$el.index()).to.equal(expectedIndex);
            expect(expectedIndex).to.not.equal(-1);
        });

        it("jQuery object", function() {
            this.view.addRegion('test', this.view.$(':first-child'));
            this.view.render();
            var expectedIndex = this.view.test.view.$el.index();

            this.view.test.attach(this.newView);

            expect(this.newView.$el.index()).to.equal(expectedIndex);
            expect(expectedIndex).to.not.equal(-1);
        });
    });

    describe("#_ensureView()", function() {
        it("sets #view to a passed in view", function() {
            expect(this.region.view).to.equal(this.view);
        });

        it("sets #view to a #_view if one is not passed in", function() {
            var region = new Minionette.Region();

            expect(region.view).to.equal(region._view);
        });

        it("sets #view to #_view if passed in view is falsey", function() {
            var region = this.view.addRegion('region', null);

            expect(region.view).to.equal(region._view);
        });

        it("sets #_view to the matched element if passed in view is a selector", function() {
            var selector = ':first-child'
            this.view.render();
            this.view.addRegion('region', selector);

            expect(this.view.region._view.el).to.equal(this.view.$(selector)[0])
        });

        it("sets #_view to the matched element if passed in view is a jQuery object", function() {
            var $selector = this.view.$(':first-child');
            this.view.render();
            this.view.addRegion('region', $selector);

            expect(this.view.region._view.el).to.equal($selector[0])
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
            var spy = this.sinon.spy(this.view, 'remove');
            this.region.detach();

            this.region.attach(this.newView);

            expect(spy).to.have.been.called;
        });

        it("replaces current view#el with newView#el (the same index in parent)", function() {
            window.test = this.view.$el;
            this.parentView.render();
            this.view.render();
            var expectedIndex = this.view.$el.index();

            this.region.attach(this.newView);

            expect(this.newView.$el.index()).to.equal(expectedIndex);
            expect(expectedIndex).to.not.equal(-1);
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
            expect(expectedIndex).to.not.equal(-1);
        });

        it("will correctly render even when not rendered and initialized with jQuery object", function() {
            var selector = ':first-child',
                $selector = this.view.$(selector);
            this.view.addRegion('region', $selector);
            this.view.region.attach(this.newView);


            this.view.render();

            var expectedIndex = this.view.$(selector).index();
            expect(this.newView.$el.index()).to.equal(expectedIndex);
            expect(expectedIndex).to.not.equal(-1);
        });
    });

    describe("#detach()", function() {
        it("sets #_detachedView to the old #view", function() {
            var oldView = this.region.view;

            this.region.detach();

            expect(this.region._detachedView).to.equal(oldView);
        });

        it("doesn't leak a previous #_detachedView", function() {
            var oldView = this.region.view;

            this.region.detach();
            this.region.detach();

            expect(this.region._detachedView).to.equal(oldView);
        });

        it("sets #view to #_view", function() {
            this.region.detach();

            expect(this.region.view).to.equal(this.region._view);
        });

        it("doesn't detach #_view", function() {
            this.region.detach();
            this.region.detach();

            expect(this.region._detachedView).to.not.equal(this.region._view);
        });

        it("replaces current view#el with _view#el (the same index in parent)", function() {
            this.view.render();
            this.parentView.render();
            var expectedIndex = this.view.$el.index();

            this.region.detach();

            expect(this.region._view.$el.index()).to.equal(expectedIndex);
            expect(expectedIndex).to.not.equal(-1);
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
            this.parentView.render();
            this.region.detach();
        });

        it("scopes #reattach() to _parent", function() {
            this.parentView.$el.detach(); // Make sure parentView isn't in the document.body
            var expectedIndex = this.region.view.$el.index();

            this.region.reattach();

            expect(this.view.$el.index()).to.equal(expectedIndex);
            expect(expectedIndex).to.not.equal(-1);
        });

        it("replaces view#el with _detachedView#el", function() {
            var expectedIndex = this.region.view.$el.index();

            this.region.reattach();

            expect(this.view.$el.index()).to.equal(expectedIndex);
            expect(expectedIndex).to.not.equal(-1);
        });

        it("deletes #_detachedView so it can't be re#attach()ed", function() {
            this.region.reattach();

            expect(this.region._detachedView).to.not.exist;
        });

        it("will not cause #_view to become detached", function() {
            this.region.reattach();
            expect(this.region.view).to.equal(this.view);
            this.region.reattach();
            expect(this.region.view).to.equal(this.view);
            this.region.reattach();
            expect(this.region.view).to.equal(this.view);
            this.region.reattach();
            expect(this.region.view).to.equal(this.view);

            expect(this.region.view.$el.parent()).to.exist;
        });

        it("will reattach even when initialized with selector and never bound #_view to element", function() {
            var selector = ':first-child';
            this.view.addRegion('region', selector);
            this.view.$el.html(this.view.template(this.view._serialize()));

            var expectedIndex = this.view.$(selector).index();

            this.view.region.reattach();

            expect(this.view.region.view.$el.index()).to.equal(expectedIndex);
            expect(expectedIndex).to.not.equal(-1);
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
            this.region.remove();

            expect(this.parentView.region).to.not.exist;
        });
    });

    describe("#reset()", function() {
        it("replaces view#el with _view#el", function() {
            this.parentView.render();
            expectedIndex = this.view.$el.index();

            this.region.reset();

            expect(this.region._view.$el.index()).to.equal(expectedIndex);
            expect(expectedIndex).to.not.equal(-1);
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
            this.parentView.render();
            var expectedIndex = this.view.$el.index();

            this.region.reset();

            expect(this.region._view.$el.index()).to.equal(expectedIndex);
            expect(expectedIndex).to.not.equal(-1);
        });

        it("only resets if #view equals passed in view", function() {
            var v = new Minionette.View();

            this.region._removeView(v);

            expect(this.region.view).to.equal(this.view);
        });
    });
});
