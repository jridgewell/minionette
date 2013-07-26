define(function() {
    describe('Minionette.View', function() {
        beforeEach(function() {
            this.view = new Minionette.View();
        });
        afterEach(function() {
            this.view.remove();
        });

        describe("constructor", function() {
            it("calls Backbone.View's constructor", function() {
                var spy = this.sinon.spy(Backbone, 'View');

                new Minionette.View();

                expect(spy).to.have.been.called;
            });

            it("initializes _subViews", function() {
                expect(this.view._subViews).to.be.defined;
            });

            describe("Model Events", function() {
                before(function() {
                    this.spy = this.sinon.spy();
                    this.ModelEventTest = Minionette.View.extend({
                        modelEvents: {
                            'change': this.spy
                        }
                    });
                    this.model = new Backbone.Model();
                });

                it("listens for model events", function() {
                    var view = new this.ModelEventTest({model: this.model});

                    view.noop;
                    this.model.trigger('change');

                    expect(this.spy).to.have.been.called;
                });
            });

            describe("Collection Events", function() {
                before(function() {
                    this.spy = this.sinon.spy();
                    this.CollectionEventTest = Minionette.View.extend({
                        collectionEvents: {
                            'change': this.spy
                        }
                    });
                    this.collection = new Backbone.Collection();
                });

                it("listens for collection events", function() {
                    var view = new this.CollectionEventTest({collection: this.collection});

                    view.noop;
                    this.collection.trigger('change');

                    expect(this.spy).to.have.been.called;
                });
            });

            describe("Regions", function() {
                before(function() {
                    this.regionView = new Minionette.View();
                    this.RegionTest = Minionette.View.extend({
                        regions: {
                            region: this.regionView
                        }
                    });
                });

                it("attaches regions to the view", function() {
                    var view = new this.RegionTest();
                    expect(view.region.view).to.equal(this.regionView);
                });
            });
        });

        describe("instances", function() {
            it("creates #template()", function() {
                expect(this.view.template).to.be.defined;
                expect(this.view.template()).to.be.defined;
            });

            it("sets Region to Minionette.Region", function() {
                expect(this.view.Region).to.equal(Minionette.Region);
            });

            describe("#serializeData()", function() {
                it("returns an object", function() {
                    expect(this.view.serializeData()).to.be.an.object;
                });

                it("has #_viewHelper as 'view' key", function() {
                    expect(this.view.serializeData().view).to.equal(this.view._viewHelper);
                });
            })
            xit("#_viewHelper()");

            describe("#delegateEvents()", function() {
                it("calls Backbone.View's #delegateEvents()", function() {
                    var spy = this.sinon.spy(Backbone.View.prototype, 'delegateEvents');

                    this.view.delegateEvents();

                    expect(spy).to.have.been.called;
                });

                it("sets #_jqueryRemove() listener on $el 'remove' event", function() {
                    var spy = this.sinon.spy(this.view, '_jqueryRemove');
                    this.view.delegateEvents();

                    this.view.$el.trigger('remove');

                    expect(spy).to.have.been.called;
                });

                it("sets #_jqueryRemove() listener that is compatible with #undelegateEvents()", function() {
                    var spy = this.sinon.spy(this.view, '_jqueryRemove');
                    this.view.delegateEvents();
                    this.view.undelegateEvents();

                    this.view.$el.trigger('remove');

                    expect(spy).to.not.have.been.called;
                });
            });

            describe("#remove()", function() {
                it("triggers 'remove:before' event", function() {
                    var spy = this.sinon.spy();
                    this.view.on('remove:before', spy);

                    this.view.remove();

                    expect(spy).to.have.been.called;
                });

                it("triggers 'remove' event", function() {
                    var spy = this.sinon.spy();
                    this.view.on('remove', spy);

                    this.view.remove();

                    expect(spy).to.have.been.called;
                });

                it("removes from parent view", function() {
                    var parentView = new Minionette.View();
                    parentView.addRegion('region', this.view);
                    var spy = this.sinon.spy(parentView.region, '_removeView');

                    this.view.remove();

                    expect(spy).to.have.been.called;
                });

                it("removes regions", function() {
                    var parentView = new Minionette.View(),
                        spy = this.sinon.spy(this.view, 'remove');
                    parentView.addRegion('region', this.view);

                    parentView.remove();

                    expect(spy).to.have.been.called;
                });
            });

            describe("#render()", function() {
                it("triggers 'render:before' event", function() {
                    var spy = this.sinon.spy();
                    this.view.on('render:before', spy);

                    this.view.render();

                    expect(spy).to.have.been.called;
                });

                it("triggers 'render' event", function() {
                    var spy = this.sinon.spy();
                    this.view.on('render', spy);

                    this.view.render();

                    expect(spy).to.have.been.called;
                });

                it("detaches regions before emptying $el", function() {
                    var subView = new Minionette.View(),
                        spy = this.sinon.spy();
                    subView.$el.on('click', spy);
                    this.view.addRegion('region', subView);

                    this.view.render();

                    subView.$el.trigger('click');
                    expect(spy).to.have.been.called;
                });

                it("passes #serializeData() output to #template()", function() {
                    var spy = this.sinon.spy(this.view, 'template'),
                    serializeData = _.uniqueId;
                    this.view.serializeData = function() {
                        return serializeData;
                    };

                    this.view.render();

                    expect(spy).to.have.been.calledWith(serializeData);
                });

                it("passes #template() output to $el#html()", function() {
                    var spy = this.sinon.spy(this.view.$el, 'html'),
                    template = _.uniqueId;
                    this.view.template = function() {
                        return template;
                    };

                    this.view.render();

                    expect(spy).to.have.been.calledWith(template);
                });

                it("reattaches regions", function() {
                    var subView = (new Minionette.View({tagName: 'p'})).render();
                    this.view.template = _.template("<%= view('region') %>");
                    this.view.addRegion('region', subView);

                    this.view.render();

                    expect(this.view.$(subView.$el)).to.exist;
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

            describe("#_jqueryRemove()", function() {
                it("triggers 'remove:jquery' event", function() {
                    var spy = this.sinon.spy();
                    this.view.on('remove:jquery', spy);

                    this.view._jqueryRemove();

                    expect(spy).to.have.been.called;
                });

                it("calls #remove()", function() {
                    var spy = this.sinon.spy(this.view, 'remove');

                    this.view._jqueryRemove();

                    expect(spy).to.have.been.called;
                });
            });

            describe("#addRegion()", function() {
                xit("do something");
            });
        });
    });
});
