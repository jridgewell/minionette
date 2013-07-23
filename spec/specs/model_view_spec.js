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
                    this.model.set(_.uniqueId(), _.uniqueId());
                    expect(this.view.serializeData()).to.deep.equal(this.model.attributes);
                });
            });
        });
    });
});
