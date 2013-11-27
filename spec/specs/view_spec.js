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
                regions: {
                    region: regionView
                }
            });

            it("attaches regions to the view", function() {
                view = new RegionTest();

                expect(view.region.view).to.equal(regionView);
            });
        });
    });

    describe("instances", function() {
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
                innerView.template = _.template('test');
                view.addRegion('region', innerView);
            });

            it("return a blank string if passed in region name isn't set", function() {
                var ret = view._viewHelper('notset');

                expect(ret).to.equal('');
            });

            it("renders the region", function() {
                var spy = sinon.spy(innerView, 'render');
                view._viewHelper('region');

                expect(spy).to.have.been.called;
            });

            it("returns the regions rendered outerHTML", function() {
                var ret = view._viewHelper('region');

                expect(ret).to.equal('<p>test</p>');
            });
        });

        describe("#remove()", function() {
            it("triggers 'remove' event", function() {
                var spy = sinon.spy();
                view.on('remove', spy);

                view.remove();

                expect(spy).to.have.been.called;
            });

            it("triggers 'removed' event", function() {
                var spy = sinon.spy();
                view.on('removed', spy);

                view.remove();

                expect(spy).to.have.been.called;
            });

            it("removes from parent view", function() {
                var subView = new Minionette.View();
                view.addRegion('region', subView);
                var spy = sinon.spy(view.region, '_removeView');

                subView.remove();

                expect(spy).to.have.been.called;
            });

            it("removes regions", function() {
                var spys = [];

                for (var i = 0; i < 5; ++i) {
                    var v = new Minionette.View();
                    spys.push(sinon.spy(v, 'remove'));
                    view.addRegion('region' + i, v);
                }

                view.remove();

                _.each(spys, function(spy) {
                    expect(spy).to.have.been.called;
                }, this);
                expect(view._regions).to.be.empty;
            });
        });

        describe("#render()", function() {
            it("triggers 'render' event", function() {
                var spy = sinon.spy();
                view.on('render', spy);

                view.render();

                expect(spy).to.have.been.called;
            });

            it("triggers 'rendered' event", function() {
                var spy = sinon.spy();
                view.on('rendered', spy);

                view.render();

                expect(spy).to.have.been.called;
            });

            it("detaches regions before emptying $el", function() {
                var subView = new Minionette.View(),
                spy = sinon.spy();
                subView.$el.on('click', spy);
                view.addRegion('region', subView).render();

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

            it("passes #template() output to $el#html()", function() {
                var stub = sinon.stub(view.$el, 'html'),
                template = _.uniqueId();
                view.template = function() {
                    return template;
                };

                view.render();

                expect(stub).to.have.been.calledWith(template);
            });

            it("suppots #template being a string", function() {
                var stub = sinon.stub(view.$el, 'html');
                view.template = 'test';

                view.render();

                expect(stub).to.have.been.calledWith(view.template);
            });


            it("reattaches regions", function() {
                var subView = new Minionette.View({tagName: 'p'});
                view.template = _.template("<%= view('region') %>");
                view.addRegion('region', subView).render();

                view.render();

                expect(view.$el).to.have(subView.$el);
            });

            it("returns the view", function() {
                var ret = view.render();

                expect(ret).to.equal(view);
            });

            it("Integration Test", function() {
                var subView = new Minionette.View({tagName: 'p'});
                subView.template = _.template('subView');
                view.addRegion('region', subView).render();
                view.template = _.template('<p>before</p><%= view("region") %><p>after</p>');

                view.render();

                expect(view.$el).to.contain('beforesubViewafter');
            });

        });

        describe("#addRegion()", function() {
            var innerView, region;
            beforeEach(function() {
                innerView = new Minionette.View();
                region = view.addRegion('region', innerView);
            });

            it("creates new region from #Region", function() {
                var spy = sinon.spy(view, 'Region');

                view.addRegion('region', innerView);

                expect(spy).to.have.been.called;
            });

            it("removes the old region if name is the same", function() {
                region = view.addRegion('region', innerView),
                spy = sinon.spy(region, 'remove');

                view.addRegion('region', innerView);

                expect(spy).to.have.been.called;
            });

            it("sets region#parent to this", function() {
                expect(region._parent).to.equal(view);
            });

            it("sets this#[region] and this#_regions[region] to the region", function() {
                expect(view.region).to.equal(region);
                expect(view._regions.region).to.equal(region);
            });

            it("returns the region", function() {
                region = new Minionette.Region();
                view.Region = function() {
                    return region;
                };

                var ret = view.addRegion('region', innerView);

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

                expect(view.view1.view).to.equal(view1);
                expect(view.view2.view).to.equal(view2);
            });
        });
    });
});
