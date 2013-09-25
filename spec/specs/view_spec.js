define(function() {
    describe('Minionette.View', function() {
        beforeEach(function() {
            this.view = new Minionette.View();
        });
        afterEach(function() {
            this.view.remove();
            delete this.view;
        });

        describe("constructor", function() {
            it("calls Backbone.View's constructor", function() {
                var spy = sinon.spy(Backbone, 'View');

                new Minionette.View();

                expect(spy).to.have.been.called;
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
                    var view = new ModelEventTest({model: model});

                    model.trigger('change');

                    expect(spy).to.have.been.called;

                    view.remove();
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
                    var view = new CollectionEventTest({collection: collection});

                    collection.trigger('change');

                    expect(spy).to.have.been.called;

                    view.remove();
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
                    var view = new RegionTest();

                    expect(view.region.view).to.equal(regionView);

                    view.remove();
                });
            });
        });

        describe("instances", function() {
            it("creates #template()", function() {
                expect(this.view.template).to.exist;
                expect(this.view.template()).to.exist;
            });

            it("sets Region to Minionette.Region", function() {
                expect(this.view.Region).to.equal(Minionette.Region);
            });

            describe("#serialize()", function() {
                it("returns an object", function() {
                    expect(this.view.serialize()).to.be.an.object;
                });
            });

            describe("#_serialize()", function() {
                it("merges #serialize()", function() {
                    var key = _.uniqueId(),
                        value = _.uniqueId();
                    this.view.serialize = function() {
                        var obj = {};
                        obj[key] = value;
                        return obj;
                    };

                    expect(this.view._serialize()[key]).to.equal(value);
                });

                it("does not modify the #serialize()'s return value'", function() {
                    var object = {test: 1};
                    this.view.serialize = function() {
                        return object;
                    };

                    var ret = this.view._serialize();
                    ret.test = 2;

                    expect(object.test).to.equal(1);
                });

                it("can have view overridden by #serialize()", function() {
                    var value = _.uniqueId();
                    this.view.serialize = function() {
                        return {view: value};
                    };

                    expect(this.view._serialize().view).to.equal(value);
                });

                it("has #_viewHelper as 'view' key", function() {
                    expect(typeof this.view._serialize().view).to.equal('function');
                });
            });

            describe('#_viewHelper()', function() {
                beforeEach(function() {
                    this.innerView = new Minionette.View({tagName: 'p'});
                    this.innerView.template = _.template('test');
                    this.view.addRegion('region', this.innerView);
                });
                afterEach(function() {
                    delete this.innerView;
                });

                it("return a blank string if passed in region name isn't set", function() {
                    var ret = this.view._viewHelper('notset');

                    expect(ret).to.equal('');
                });

                it("renders the region", function() {
                    var spy = this.sinon.spy(this.innerView, 'render');
                    this.view._viewHelper('region');

                    expect(spy).to.have.been.called;
                });

                it("returns the regions rendered outerHTML", function() {
                    var ret = this.view._viewHelper('region');

                    expect(ret).to.equal('<p>test</p>');
                });
            });

            describe("#remove()", function() {
                it("triggers 'remove' event", function() {
                    var spy = this.sinon.spy();
                    this.view.on('remove', spy);

                    this.view.remove();

                    expect(spy).to.have.been.called;
                });

                it("triggers 'removed' event", function() {
                    var spy = this.sinon.spy();
                    this.view.on('removed', spy);

                    this.view.remove();

                    expect(spy).to.have.been.called;
                });

                it("removes from parent view", function() {
                    var subView = new Minionette.View();
                    this.view.addRegion('region', subView);
                    var spy = this.sinon.spy(this.view.region, '_removeView');

                    subView.remove();

                    expect(spy).to.have.been.called;
                });

                it("removes regions", function() {
                    var subView = new Minionette.View(),
                        spy = this.sinon.spy(subView, 'remove');
                    this.view.addRegion('region', subView);

                    this.view.remove();

                    expect(spy).to.have.been.called;
                });
            });

            describe("#render()", function() {
                it("triggers 'render' event", function() {
                    var spy = this.sinon.spy();
                    this.view.on('render', spy);

                    this.view.render();

                    expect(spy).to.have.been.called;
                });

                it("triggers 'rendered' event", function() {
                    var spy = this.sinon.spy();
                    this.view.on('rendered', spy);

                    this.view.render();

                    expect(spy).to.have.been.called;
                });

                it("detaches regions before emptying $el", function() {
                    var subView = new Minionette.View(),
                        spy = this.sinon.spy();
                    subView.$el.on('click', spy);
                    this.view.addRegion('region', subView).render();

                    this.view.render();

                    subView.$el.trigger('click');
                    expect(spy).to.have.been.called;
                });

                it("passes #_serialize() output to #template()", function() {
                    var stub = this.sinon.stub(this.view, 'template'),
                        serialize = _.uniqueId();
                    this.view._serialize = function() {
                        return serialize;
                    };

                    this.view.render();

                    expect(stub).to.have.been.calledWith(serialize);
                });

                it("passes #template() output to $el#html()", function() {
                    var stub = this.sinon.stub(this.view.$el, 'html'),
                    template = _.uniqueId();
                    this.view.template = function() {
                        return template;
                    };

                    this.view.render();

                    expect(stub).to.have.been.calledWith(template);
                });

                it("reattaches regions", function() {
                    var subView = new Minionette.View({tagName: 'p'});
                    this.view.template = _.template("<%= view('region') %>");
                    this.view.addRegion('region', subView).render();

                    this.view.render();

                    expect(this.view.$el).to.have(subView.$el);
                });

                it("returns the view", function() {
                    var ret = this.view.render();

                    expect(ret).to.equal(this.view);
                });

                it("Integration Test", function() {
                    var subView = new Minionette.View({tagName: 'p'});
                    subView.template = _.template('subView');
                    this.view.addRegion('region', subView).render();
                    this.view.template = _.template('<p>before</p><%= view("region") %><p>after</p>');

                    this.view.render();

                    expect(this.view.$el).to.contain('beforesubViewafter');
                });

            });

            describe("#addRegion()", function() {
                beforeEach(function() {
                    this.innerView = new Minionette.View();
                    this.region = this.view.addRegion('region', this.innerView);
                });
                afterEach(function() {
                    delete this.region;
                    delete this.innerView;
                });

                it("creates new region from #Region", function() {
                    var spy = this.sinon.spy(this.view, 'Region');

                    this.view.addRegion('region', this.innerView);

                    expect(spy).to.have.been.called;
                });

                it("removes the old region if name is the same", function() {
                    var region = this.view.addRegion('region', this.innerView),
                        spy = this.sinon.spy(region, 'remove');

                    this.view.addRegion('region', this.innerView);

                    expect(spy).to.have.been.called;
                });

                it("sets region#name to the name", function() {
                    expect(this.region.name).to.equal('region');
                });

                it("sets region#parent to this", function() {
                    expect(this.region._parent).to.equal(this.view);
                });

                it("sets this#[region] and this#_regions[region] to the region", function() {
                    expect(this.view.region).to.equal(this.region);
                    expect(this.view._regions.region).to.equal(this.region);
                });

                it("returns the region", function() {
                    // debugger;
                    var region = new Minionette.Region();
                    this.view.Region = function() {
                        return region;
                    };

                    var ret = this.view.addRegion('region', this.innerView);

                    expect(ret).to.equal(region);
                });
            });

            describe("#addRegions()", function() {
                it("creates a region for each key:value pair", function() {
                    var view1 = new Minionette.View(),
                        view2 = new Minionette.View();

                    this.view.addRegions({
                        view1: view1,
                        view2: view2
                    });

                    expect(this.view.view1.view).to.equal(view1);
                    expect(this.view.view2.view).to.equal(view2);
                });
            });
        });
    });
});
