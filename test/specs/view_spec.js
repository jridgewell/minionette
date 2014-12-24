describe('Minionette.View', function() {
    var view;
    beforeEach(function() {
        view = new Minionette.View();
    });

    describe("constructor", function() {
        it("calls Backbone.View's constructor", function() {
            var spy = sinon.spy(Backbone, 'View');

            new Minionette.View();

            expect(spy).to.have.been.called;
        });

        describe("picks options from instantiation", function() {
            var opts;
            afterEach(function() {
                _.each(opts, function(val, key) {
                    expect(view[key]).to.equal(val);
                }, this);
            });

            it("picks 'regions'", function() {
                opts = {regions: {test: false}};
                view = new Minionette.View(opts);
            });

            it("picks 'Region'", function() {
                opts = {Region: function() {}};
                view = new Minionette.View(opts);
            });

            it("picks 'regions'", function() {
                opts = {template: function() {}};
                view = new Minionette.View(opts);
            });

            it("picks 'ui'", function() {
                opts = {ui: {test: 'selector'}};
                view = new Minionette.View(opts);
            });
        });

        describe("Model Events", function() {
            var spy = sinon.spy();
            var ModelEventTest = Minionette.View.extend({
                modelEvents: {
                    'change': spy
                }
            });
            var model = new Backbone.Model();

            it("listens for model events", function() {
                new ModelEventTest({model: model});

                model.trigger('change');

                expect(spy).to.have.been.called;
            });

            it("doesn't throw error when no model", function() {
                new ModelEventTest({model: null});
                // Noop. Error will be thrown by constructor
            });
        });

        describe("Collection Events", function() {
            var spy = sinon.spy();
            var CollectionEventTest = Minionette.View.extend({
                collectionEvents: {
                    'change': spy
                }
            });
            var collection = new Backbone.Collection();

            it("listens for collection events", function() {
                new CollectionEventTest({collection: collection});

                collection.trigger('change');

                expect(spy).to.have.been.called;
            });

            it("doesn't throw error when no collection", function() {
                new CollectionEventTest({collection: null});
                // Noop. Error will be thrown by constructor
            });
        });

        describe("Regions", function() {
            var regionView = new Minionette.View();
            var RegionTest = Minionette.View.extend({
                template: '<div id="test"></div>',
                regions: {
                    subview: regionView,
                    selector: '#test'
                }
            });

            it("attaches view to the region", function() {
                view = new RegionTest();

                expect(view.subview).to.equal(regionView);
            });

            it("attaches selector to the region", function() {
                view = new RegionTest();

                var expectedIndex = view.$(view.regions.selector).index();
                var subView = view.selector;
                expect(subView.$el.index()).to.equal(expectedIndex);
            });
        });
    });

    describe("instances", function() {
        describe("#initialize", function() {
            it("allows custom regions", function() {
                var regions = {};
                var view = new (Minionette.View.extend({
                    initialize: function() {
                        this.regions = regions;
                    }
                }))();

                expect(view.regions).to.equal(regions);
            });

            it("allows custom modelEvents", function() {
                var modelEvents = {};
                var view = new (Minionette.View.extend({
                    initialize: function() {
                        this.modelEvents = modelEvents;
                    }
                }))();

                expect(view.modelEvents).to.equal(modelEvents);
            });

            it("allows custom collectionEvents", function() {
                var collectionEvents = {};
                var view = new (Minionette.View.extend({
                    initialize: function() {
                        this.collectionEvents = collectionEvents;
                    }
                }))();

                expect(view.collectionEvents).to.equal(collectionEvents);
            });
        });

        it("creates #template()", function() {
            expect(view.template).to.exist;
            expect(view.template()).to.exist;
        });

        it("sets Region to Minionette.Region", function() {
            expect(view.Region).to.equal(Minionette.Region);
        });

        describe("#serialize()", function() {
            it("returns an object", function() {
                expect(view.serialize()).to.be.an.object;
            });
        });

        describe("#_serialize()", function() {
            it("merges #serialize()", function() {
                var key = _.uniqueId(),
                value = _.uniqueId();
                view.serialize = function() {
                    var obj = {};
                    obj[key] = value;
                    return obj;
                };

                expect(view._serialize()[key]).to.equal(value);
            });

            it("does not modify the #serialize()'s return value'", function() {
                var object = {test: 1};
                view.serialize = function() {
                    return object;
                };

                var ret = view._serialize();
                ret.test = 2;

                expect(object.test).to.equal(1);
            });

            it("can have view overridden by #serialize()", function() {
                var value = _.uniqueId();
                view.serialize = function() {
                    return {view: value};
                };

                expect(view._serialize().view).to.equal(value);
            });

            it("has #_viewHelper as 'view' key", function() {
                expect(typeof view._serialize().view).to.equal('function');
            });
        });

        describe('#_viewHelper()', function() {
            var innerView;
            beforeEach(function() {
                innerView = new Minionette.View({tagName: 'p'});
                view.addRegion('subview', innerView);
            });

            it("creates the region if region isn't set yet", function() {
                expect(view.notset).to.not.exist;
                view._viewHelper('notset');
                expect(view.notset).to.exist;
            });

            it("does not render the region", function() {
                var spy = sinon.spy(innerView, 'render');
                view._viewHelper('subview');

                expect(spy).not.to.have.been.called;
            });

            it("returns the regions placeholder", function() {
                var ret = view._viewHelper('subview');

                expect(ret.toLowerCase()).to.equal('<p></p>');
            });
        });

        describe("#remove()", function() {
            beforeEach(function() {
                view.template = '<p></p>';
            });

            it("triggers 'remove' event", function() {
                var spy = sinon.spy();
                view.on('remove', spy);

                view.remove();

                expect(spy).to.have.been.calledWith(view);
            });

            it("triggers 'removed' event", function() {
                var spy = sinon.spy();
                view.on('removed', spy);

                view.remove();

                expect(spy).to.have.been.calledWith(view);
            });

            it("triggers 'remove' event before any DOM manipulations", function() {
                var region = view.addRegion('subview', 'p');
                view.render();

                view.on('remove', function() {
                    expect(view.$el).to.have(region.view.$el);
                });

                view.remove();
            });

            it("triggers 'removed' event after any DOM manipulations", function() {
                var region = view.addRegion('subview', 'p');
                view.render();

                var $r = view.subview.$el;

                view.on('removed', function() {
                    expect(view.$el).not.to.have($r);
                });

                view.remove();
            });

            it("triggers subviews's 'remove' event before any DOM manipulations", function() {
                var region = view.addRegion('subview', 'p');
                view.render();

                var $wrapper = $('<div>').append(view.$el);

                region.on('remove', function() {
                    expect($wrapper).to.have(region.view.$el);
                });

                view.remove();
            });

            it("triggers subview's 'removed' event after any DOM manipulations", function() {
                var region = view.addRegion('subview', 'p');
                view.render();

                var $wrapper = $('<div>').append(view.$el);
                var $r = region.view.$el;

                region.on('removed', function() {
                    expect($wrapper).not.to.have($r);
                });

                view.remove();
            });

            it("removes from parent view", function() {
                var subView = new Minionette.View();
                view.addRegion('subview', subView);

                subView.remove();

                expect(view.subview).not.to.equal(subView);
            });

            it("removes regions", function() {
                var spys = [];

                for (var i = 0; i < 5; ++i) {
                    var v = new Minionette.View();
                    spys.push(sinon.spy(v, 'remove'));
                    view.addRegion('subview' + i, v);
                }

                view.remove();

                _.each(spys, function(spy) {
                    expect(spy).to.have.been.called;
                }, this);
                expect(view._regions).to.be.empty;
            });

            it("returns the view", function() {
                var ret = view.remove();

                expect(ret).to.equal(view);
            });
        });

        describe("#render()", function() {
            beforeEach(function() {
                view.template = _.template('<p></p>');
            });

            it("triggers 'render' event", function() {
                var spy = sinon.spy();
                view.on('render', spy);

                view.render();

                expect(spy).to.have.been.calledWith(view);
            });

            it("triggers 'rendered' event", function() {
                var spy = sinon.spy();
                view.on('rendered', spy);

                view.render();

                expect(spy).to.have.been.calledWith(view);
            });

            it("triggers 'render' event before any DOM manipulations", function() {
                view.addRegion('subview', 'p');
                view.render();

                view.on('render', function() {
                    expect(view.$el).to.have(view.subview.$el);
                });

                view.render();
            });

            it("triggers 'rendered' event after any DOM manipulations", function() {
                view.render();

                var $p = view.$('p');

                view.on('rendered', function() {
                    expect(view.$el).not.to.have($p);
                });

                view.render();
            });

            it("detaches regions before emptying $el", function() {
                var subView = new Minionette.View(),
                spy = sinon.spy();
                subView.$el.on('click', spy);
                view.addRegion('subview', subView.render());
                view.template = '<div></div>'

                view.render();

                subView.$el.trigger('click');
                expect(spy).to.have.been.called;
            });

            it("passes #_serialize() output to #template()", function() {
                var stub = sinon.stub(view, 'template'),
                serialize = _.uniqueId();
                view._serialize = function() {
                    return serialize;
                };

                view.render();

                expect(stub).to.have.been.calledWith(serialize);
            });

            it("renders with output of #template", function() {
                template = _.uniqueId();
                view.template = function() {
                    return template;
                };

                view.render();

                expect(view.el.innerHTML).to.equal(template);
            });

            it("supports #template being a string", function() {
                view.template = 'test';

                view.render();

                expect(view.el.innerHTML).to.equal('test');
            });

            it("reattaches regions", function() {
                var region = view.addRegion('subview', 'p');
                view.render();
                region.attach(new Minionette.View());
                var $v = region.view.$el;

                view.render();

                expect(view.$el).to.have($v);
            });

            it("throws error if it cannot reattach region", function() {
                view.addRegion('subview', 'notexist');
                expect(function() { view.render(); }).to.throw(Error);
            });

            it("throws error if view template helper used with selector region", function() {
                view.addRegion('subview', 'p');
                view.template = _.template('<p></p><%= view("subview") %>');

                expect(function() { view.render(); }).to.throw(Error);
            });

            it("sets ui elements", function() {
                view.ui = {test: '.selector'};
                view.template = _.template('<p class="selector"></p>');

                view.render();

                expect(view.$test).to.be.an.instanceof(Backbone.$);
                expect(view.$test).to.match('.selector');
            });

            it("returns the view", function() {
                var ret = view.render();

                expect(ret).to.equal(view);
            });

            it("Integration Test", function() {
                var subView = new Minionette.View({tagName: 'span'});
                subView.template = _.template('subView');
                view.addRegion('subview', subView.render());
                view.template = _.template('<p>before</p><%= view("subview") %><p>after</p>');

                view.render();

                expect(view.el.innerHTML).to.equal('<p>before</p><span>subView</span><p>after</p>');
            });

        });

        describe("#addRegion()", function() {
            var innerView, region;
            beforeEach(function() {
                innerView = new Minionette.View();
                region = view.addRegion('subview', innerView);
            });

            it("creates new region from #Region", function() {
                var spy = sinon.spy(view, 'Region');

                view.addRegion('subview', innerView);

                expect(spy).to.have.been.called;
            });

            it("removes the old region if name is the same", function() {
                region = view.addRegion('subview', innerView),
                    spy = sinon.spy(region, 'remove');

                view.addRegion('subview', innerView);

                expect(spy).to.have.been.called;
            });

            it("sets this#[region] to the region's view", function() {
                expect(view.subview).to.equal(innerView);
            });

            it("uses region constructed from #buildRegion", function() {
                var expected = new Minionette.Region();
                view.buildRegion = function() { return expected; };

                region = view.addRegion('subview', innerView);

                expect(region).to.equal(expected);
            });

            it("passes region's name in options to #buildRegion", function() {
                var spy = sinon.spy(view, 'buildRegion');

                view.addRegion('subview', innerView);

                var options = spy.getCall(0).args[0];
                expect(options.name).to.equal('subview');
            });

            it("returns the region", function() {
                region = new Minionette.Region();
                view.Region = function() {
                    return region;
                };

                var ret = view.addRegion('subview', innerView);

                expect(ret).to.equal(region);
            });
        });

        describe("#addRegions()", function() {
            it("creates a region for each key:value pair", function() {
                var view1 = new Minionette.View(),
                view2 = new Minionette.View();

                view.addRegions({
                    view1: view1,
                    view2: view2
                });

                expect(view.view1).to.equal(view1);
                expect(view.view2).to.equal(view2);
            });

            it("returns the view", function() {
                var ret = view.addRegions();

                expect(ret).to.equal(view);
            });
        });

        describe("#region", function() {
            it("returns requested region");
            it("instantiates new region if one does not exist");
        });
    });
});
