define(function(require) {
    describe('Minionette.View', function() {
        beforeEach(function() {
            this.view = new Minionette.View;
        })
        afterEach(function() {
            this.view.remove();
        });

        describe("constructor", function() {
            it("calls Backbone.View's constructor", function() {
                var spy = this.sinon.spy(Backbone, 'View');

                new Minionette.View;

                expect(spy).to.have.been.called;
            });

            it("initializes _subViews", function() {
                expect(this.view._subViews).to.not.be.undefined;
            });

            xit("listens for model events", function() {});
            xit("listens for collection events", function() {});

        });

        describe("instances", function() {
            it("creates #template function", function() {
                expect(this.view.template).to.be.a.function;
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
                    var v = new Backbone.View,
                        spy = this.sinon.spy(v, 'remove');
                    this.view._subViews[0] = v;

                    this.view.remove();

                    expect(spy).to.have.been.called;
                });
            });

            describe("#assign", function() {
                beforeEach(function() {
                    this.subView = new Backbone.View({id: 'subView'});
                });

                it("takes a selector and a subView as arguments", function() {
                    var selector = '.selector',
                        spy = this.sinon.spy(this.subView, 'setElement');
                    this.view.$el.append('<div class="selector" />');

                    this.view.assign(selector, this.subView);

                    expect(spy).to.have.been.calledWith(this.view.$(selector));
                });

                it("takes an object (with keys as selectors and values as subViews) as an argument", function() {
                    var subView2 = new Backbone.View,
                        subViews = {
                            '.selector': this.subView,
                            '.test': subView2
                        },
                        spy = this.sinon.spy(this.subView, 'setElement'),
                        spy2 = this.sinon.spy(subView2, 'setElement');
                    this.view.$el.append('<div class="selector" />');
                    this.view.$el.append('<div class="test" />');

                    this.view.assign(subViews);

                    expect(spy).to.have.been.calledWith(this.view.$('.selector'));
                    expect(spy2).to.have.been.calledWith(this.view.$('.test'));
                });

                describe("replace param", function() {
                    it("can optionally take a replace param", function() {
                        var selector = '.selector',
                        spy = this.sinon.spy(this.subView, 'setElement');
                        this.view.$el.append('<div class="selector" />');

                        this.view.assign(selector, this.subView, true);

                        expect(spy).to.not.have.been.called;
                        expect(this.view.$(this.subView.el).get(0)).to.not.be.undefined;
                    });

                    it("can optionally take a replace param with alternate syntax", function() {
                        var subView2 = new Backbone.View,
                        subViews = {
                            '.selector': this.subView,
                            '.test': subView2
                        },
                        spy = this.sinon.spy(this.subView, 'setElement'),
                        spy2 = this.sinon.spy(subView2, 'setElement');
                        this.view.$el.append('<div class="selector" />');
                        this.view.$el.append('<div class="test" />');

                        this.view.assign(subViews, true);

                        expect(spy).to.not.have.been.calledWith(this.view.$('.selector'));
                        expect(spy2).to.not.have.been.calledWith(this.view.$('.test'));
                    });
                });
            });

            describe("#_jqueryRemove", function() {
                it("is called when jQuery removes $el", function() {
                    var spy = this.sinon.spy(this.view, '_jqueryRemove');

                    this.view.delegateEvents();
                    this.view.$el.remove();

                    expect(spy).to.have.been.called;
                });

                it("is not called with #undelegateEvents", function() {
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
            });
        });
    });
});
