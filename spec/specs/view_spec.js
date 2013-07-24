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

            describe("SubViews", function() {
                xit('subviews');
            });
        });

        describe("instances", function() {
            it("creates #template()", function() {
                expect(this.view.template).to.be.defined;
                expect(this.view.template()).to.be.defined;
            });

            it("creates #serializeData()", function() {
                expect(this.view.serializeData).to.be.defined;
                expect(this.view.serializeData()).to.be.an.object;
            });

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
                    parentView._addSubView(this.view);

                    this.view.remove();

                    expect(_.values(parentView._subViews)).to.not.include(this.view);
                });

                it("removes subViews", function() {
                    var parentView = new Minionette.View(),
                        spy = this.sinon.spy(this.view, 'remove');
                    parentView._addSubView(this.view);

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

                it("detaches subViews before emptying $el", function() {
                    var subView = new Minionette.View(),
                        spy = this.sinon.spy();
                    this.view.$el.append('<div id="test" />');
                    this.view.attach('#test', subView);
                    subView.$el.on('click', spy);

                    this.view.render();

                    expect(spy).to.not.have.been.called;
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

                it("returns the view", function() {
                    var ret = this.view.render();

                    expect(ret).to.equal(this.view);
                });
            });

            describe("#_jqueryRemove()", function() {
                it("triggers 'remove:jquery' event", function() {
                    var spy = this.sinon.spy();
                    this.view.on('remove:jquery', spy);

                    this.view._jqueryRemove();

                    expect(spy).to.have.been.called;
                });

                it("Removes from parent view", function() {
                    var parentView = new Minionette.View();
                    parentView._addSubView(this.view);

                    this.view._jqueryRemove();

                    expect(_.values(parentView._subViews)).to.not.include(this.view);
                });

                it("stops listening", function() {
                    var spy = this.sinon.spy(this.view, 'stopListening');

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
