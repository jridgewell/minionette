define(function() {
    describe('Minionette.ModelView', function() {
        describe("instances", function() {
            beforeEach(function() {
                this.model = new Backbone.Model();
                this.view = new Minionette.ModelView({model: this.model});
            });

            describe("Model Events", function() {
                it("#render() on model's 'change' event", function() {
                    expect(this.view.modelEvents.change).to.equal('render');
                });

                it("#remove() on model's 'destroy' event", function() {
                    expect(this.view.modelEvents.destroy).to.equal('remove');
                });
            });

            describe("#serializeData()", function() {
                it("calls Minionette.View#serializeData()", function() {
                    var spy = this.sinon.spy(Minionette.View.prototype, 'serializeData');

                    this.view.serializeData();

                    expect(spy).to.have.been.called;
                });

                it("adds #model#attributes to return", function() {
                    this.model.set(_.uniqueId(), _.uniqueId());
                    var ret = this.view.serializeData();

                    _.each(this.model.attributes, function(value, key) {
                        expect(ret[key]).equal(value);
                    });
                    expect(ret).to.not.deep.equal(this.model.attributes);
                });

                it("returns cloned model.attributes", function() {
                    this.model.set(_.uniqueId(), _.uniqueId());
                    var ret = this.view.serializeData();

                    this.model.set('test', 'test');

                    expect(ret.test).to.not.equal('test');
                });
            });
        });
    });
});
