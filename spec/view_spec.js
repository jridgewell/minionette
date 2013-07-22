define(function(require) {
    describe('Minionette.View', function() {
        beforeEach(function() {
            this.view = new Minionette.View;
        })
        afterEach(function() {
            this.view.remove();
        });

        it('Exists', function() {
            expect(Minionette.View).to.not.be.undefined;
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
                xit();
            });

            describe("#_jqueryRemove", function() {
                it("is called when jQuery removes $el", function() {
                    var spy = this.sinon.spy(this.view, '_jqueryRemove');

                    this.view.delegateEvents();
                    this.view.$el.remove();

                    expect(spy).to.have.been.called;
                });

                it("is not called with #undelegateEvents", function() {
                    var spy = this.sinon.spy(this.view, '_jqueryRemove');

                    this.view.delegateEvents();
                    this.view.undelegateEvents();

                    expect(spy).to.not.have.been.called;
                });
            });
        });
    });
});
