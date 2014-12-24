describe('Minionette.Region', function() {
    var RegionView = Minionette.View.extend({
        template: _.template('<p>test</p><%= view("subview") %><p>test</p>')
    });
    var view, parentView, region;
    beforeEach(function() {
        view = new RegionView();
        parentView = new RegionView();
        region = parentView.addRegion('subview', view);
    });

    describe("constructor", function() {
        var newView, expectedIndex;
        beforeEach(function() {
            newView = new Minionette.View();
        });

        describe("PlaceholderView", function() {
            beforeEach(function() {
                newView = region.buildPlaceholderView();
            });

            it("sets PlaceholderView to an extended Backbone.View", function() {
                expect(newView).to.be.instanceof(Backbone.View);
            });

            it("sets tagName to span", function() {
                expect(newView.$el).to.match('span');
            });

            it("sets data attributes to region's cid", function() {
                expect(newView.$el).to.match('[data-cid="' + newView.cid + '"]');
            });

            describe("#buildPlaceholderView", function() {
                it("sets placeholder view to return value", function() {
                    var Region = Minionette.Region.extend({
                        buildPlaceholderView: function() {
                            return view;
                        }
                    });

                    region = new Region();

                    expect(region.view).to.equal(view);
                });
            });
        });

        it("falsey view", function() {
            region = view.addRegion('subview', false);
            view.render();
            expectedIndex = region.view.$el.index();

            region.attach(newView);

            expect(newView.$el.index()).to.equal(expectedIndex);
            expect(expectedIndex).to.be.above(-1);
        });

        it("real view", function() {
            region = view.addRegion('subview', new Minionette.View());
            view.render();
            expectedIndex = region.view.$el.index();

            region.attach(newView);

            expect(newView.$el.index()).to.equal(expectedIndex);
            expect(expectedIndex).to.be.above(-1);
        });

        it("selector", function() {
            region = view.addRegion('test', ':first-child');
            view.render();
            expectedIndex = region.view.$el.index();

            region.attach(newView);

            expect(newView.$el.index()).to.equal(expectedIndex);
            expect(expectedIndex).to.be.above(-1);
        });

        it("jQuery object", function() {
            region = view.addRegion('test', view.$(':first-child'));
            view.render();
            expectedIndex = region.view.$el.index();

            region.attach(newView);

            expect(newView.$el.index()).to.equal(expectedIndex);
            expect(expectedIndex).to.be.above(-1);
        });
    });

    describe("#_setView()", function() {
        it("sets #view to a passed in view", function() {
            expect(region.view).to.equal(view);
        });

        it("sets #view to new placeholder if passed in view is falsey", function() {
            region = view.addRegion('subview', null);

            expect(region.view).to.instanceof(region.PlaceholderView);
        });

        it("sets #view to the matched element if passed in view is a selector", function() {
            var selector = ':first-child';
            view.render();
            region = view.addRegion('subview', selector);

            expect(region.view.$el).to.match(selector);
        });

        it("sets #view to the matched element if passed in view is a jQuery object", function() {
            view.render();
            var $selector = view.$(':first-child');
            region = view.addRegion('subview', $selector);

            expect(region.view.$el).to.match($selector);
        });
    });

    describe("#selector", function() {
        var selector;
        beforeEach(function() {
            region = new Minionette.Region({
                el: $('<a>').attr({
                    'data-test': '',
                    'disabled': 'disabled',
                    'class': 'one two three'
                })
            });
            selector = region.selector();
        });

        it("transforms element into a selector", function() {
            expect(region.view.$el).to.match(selector);
        });

        it("special cases elements with an id", function() {
            region.view.$el.attr('id', 'tester');

            expect(region.selector()).to.equal('#tester');
        });

        it("includes tagName in selector", function() {
            expect(selector).to.match(/^a/i);
        });
        it("includes className in selector", function() {
            expect(selector).to.have.string('one.two.three');
        });

        it("includes attributes in selector", function() {
            expect(selector).to.have.string('[data-test]');
            expect(selector).to.have.string('[disabled="disabled"]');
        });

        describe("when region is instantiated with selector", function() {
            it("is overridden", function() {
                region = new Minionette.Region({
                    el: $(),
                    selector: 'tester'
                });

                expect(region.selector).to.equal('tester');
            });
        });
    });

    describe("#placeholder", function() {
        var placeholder;
        beforeEach(function() {
            region = new Minionette.Region({
                el: $('<a href="test" target>text</a>')
            });
            placeholder = region.placeholder();
        });

        it("transforms elements into a base placeholder element html", function() {
            expect($(placeholder)).to.match('a[href="test"][target]');
        });

        it("excludes children", function() {
            expect(placeholder).not.to.have.string('text');
        });

        it("handles self closing tags", function() {
            region.view.el = document.createElement('br');
            expect($(region.placeholder())).to.match('br');
        });

        it("includes all attributes", function() {
            expect(placeholder).to.have.string('href="test"');
            expect(placeholder).to.have.string('target');
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
            region = view.addRegion('subview', selector);
            region.attach(newView);
            view.template = '<p></p><span></span>';

            view.render();

            var expectedIndex = view.$(selector).index();
            expect(newView.$el.index()).to.equal(expectedIndex);
            expect(expectedIndex).to.not.equal(-1);
        });

        it("will correctly render even when not rendered and initialized with jQuery object", function() {
            var selector = ':first-child';
            var $selector = view.$(selector);
            region = view.addRegion('subview', $selector);
            region.attach(newView);
            view.template = '<p></p><span></span>';

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

        it("calls #stopListening", function() {
            var spy = sinon.spy(region, 'stopListening');

            region.remove();

            expect(spy).to.have.been.called;
        });

        it("removes itself from it's parent", function() {
            region.remove();

            expect(parentView.subview).to.not.exist;
        });

        it("returns the region", function() {
            var ret = region.remove();

            expect(ret).to.equal(region);
        });
    });

    describe("#reset()", function() {
        it("replaces view#el with new placeholder", function() {
            parentView.render();
            var expectedIndex = view.$el.index();

            region.reset();

            expect(region.view.$el.index()).to.equal(expectedIndex);
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
        it("sets #view to new placeholder", function() {
            region._removeView(view);

            expect(region.view).not.to.equal(view);
            expect(region.view).to.be.instanceof(region.PlaceholderView);
        });

        it("replaces view#el with placeholder", function() {
            parentView.render();
            var expectedIndex = view.$el.index();

            region.reset();

            expect(region.view.$el.index()).to.equal(expectedIndex);
            expect(expectedIndex).to.not.equal(-1);
        });

        it("only resets if #view equals passed in view", function() {
            var v = new Minionette.View();

            region._removeView(v);

            expect(region.view).to.equal(view);
        });
    });
});
