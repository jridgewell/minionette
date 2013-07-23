define(function() {
    describe('Minionette.ModelView', function() {
        describe("instances", function() {
            beforeEach(function() {
                this.model = new Backbone.Model();
                this.view = new Minionette.ModelView({model: this.model});
            });

            describe("Model Events", function() {
                it("#renders on model's 'change' event", function() {
                    expect(this.view.modelEvents.change).to.equal('render');
                });

                it("#removes on model's 'destroy' event", function() {
                    expect(this.view.modelEvents.destroy).to.equal('remove');
                });
            });

            describe("#serializeData", function() {
                it("returns models attributes", function() {
                    expect(this.view.serializeData()).to.equal(this.model.attributes);
                });
            });

            describe("#render", function() {
                it("fires 'render:before' event", function() {
                    var spy = this.sinon.spy();
                    this.view.on('render:before', spy);

                    this.view.render();

                    expect(spy).to.have.been.called;
                });

                it("fires 'render' event", function() {
                    var spy = this.sinon.spy();
                    this.view.on('render', spy);

                    this.view.render();

                    expect(spy).to.have.been.called;
                });

                it("detaches subViews before emptying $el", function() {
                    var subView = new Minionette.View(),
                        spy = this.sinon.spy();
                    this.view.$el.append('<div id="test" />');
                    this.view.assign('#test', subView);
                    subView.$el.on('click', spy);

                    this.view.render();

                    expect(spy).to.not.have.been.called;
                    subView.$el.trigger('click');
                    expect(spy).to.have.been.called;
                });

                it("passes #serializeData's output to #template", function() {
                    var spy = this.sinon.spy(this.view, 'template'),
                    serializeData = _.uniqueId;
                    this.view.serializeData = function() {
                        return serializeData;
                    };

                    this.view.render();

                    expect(spy).to.have.been.calledWith(serializeData);
                });

                it("passes #template's output to $el#html", function() {
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
        });
    });
});
