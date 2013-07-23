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

        });

        describe("instances", function() {
            it("creates #template function", function() {
                expect(this.view.template).to.be.defined;
                expect(this.view.template()).to.be.defined;
            });

            describe("#delegateEvents", function() {
                it("calls Backbone.View's #delegateEvents", function() {
                    var spy = this.sinon.spy(Backbone.View.prototype, 'delegateEvents');

                    this.view.delegateEvents();

                    expect(spy).to.have.been.called;
                });
            });

            describe("#remove", function() {
                it("triggers remove:before event", function() {
                    var spy = this.sinon.spy();
                    this.view.on('remove:before', spy);

                    this.view.remove();

                    expect(spy).to.have.been.called;
                });

                it("triggers remove event", function() {
                    var spy = this.sinon.spy();
                    this.view.on('remove', spy);

                    this.view.remove();

                    expect(spy).to.have.been.called;
                });

                it("removes subViews", function() {
                    var v = new Minionette.View(),
                        spy = this.sinon.spy(v, 'remove');
                    this.view._subViews[0] = v;

                    this.view.remove();

                    expect(spy).to.have.been.called;
                });
            });

            describe("#assign", function() {
                beforeEach(function() {
                    this.subView = new Minionette.View({id: 'subView'});
                    this.selector = '.selector';
                    this.spy = this.sinon.spy(this.subView, 'setElement');
                    this.view.$el.append('<div class="selector" />');
                });

                it("takes a selector and a subView as arguments", function() {
                    this.view.assign(this.selector, this.subView);

                    expect(this.spy).to.have.been.calledWith(this.view.$(this.selector));
                });

                it("sets the subView's _parentView to this", function() {
                    this.view.assign(this.selector, this.subView);

                    expect(this.subView._parentView).to.equal(this.view);
                });

                it("can optionally take a replace param", function() {
                    this.view.assign(this.selector, this.subView, true);

                    expect(this.spy).to.not.have.been.called;
                    expect(this.view.$(this.subView.el).get(0)).to.be.defined;
                });


                describe("alternate syntax", function() {
                    beforeEach(function() {
                        this.subView2 = new Minionette.View();
                        this.subViews = {'.test': this.subView2};
                        this.subViews[this.selector] = this.subView;
                        this.spy2 = this.sinon.spy(this.subView2, 'setElement');
                        this.view.$el.append('<div class="test" />');
                    });

                    it("takes an object (with keys as selectors and values as subViews) as an argument", function() {
                        this.view.assign(this.subViews);

                        expect(this.spy).to.have.been.calledWith(this.view.$('.selector'));
                        expect(this.spy2).to.have.been.calledWith(this.view.$('.test'));
                    });

                    it("can optionally take a replace param", function() {
                        this.view.assign(this.subViews, true);

                        expect(this.spy).to.not.have.been.calledWith(this.view.$('.selector'));
                        expect(this.spy2).to.not.have.been.calledWith(this.view.$('.test'));
                    });

                });
            });

            describe("#_jqueryRemove", function() {
                it("fires 'remove:jquery' event", function() {
                    var spy = this.sinon.spy();
                    this.view.on('remove:jquery', spy);

                    this.view._jqueryRemove();

                    expect(spy).to.have.been.called;
                });

                it("is not called on #undelegateEvents", function() {
                    // Why are we testing this?
                    // With the way jQuery defines special events,
                    // the "remove" event will actually fire whenever we
                    // remove the event handler from the DOM element, calling
                    // the callback. We don't want that.
                    var spy = this.sinon.spy(this.view, '_jqueryRemove');

                    this.view.delegateEvents();
                    this.view.undelegateEvents();

                    expect(spy).to.not.have.been.called;
                });

                it("is not called on jQuery #detach", function() {
                    var spy = this.sinon.spy(this.view, '_jqueryRemove');

                    this.view.delegateEvents();
                    this.view.$el.detach();

                    expect(spy).to.not.have.been.called;
                });
            });
        });
    });
});
