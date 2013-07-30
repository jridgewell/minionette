define(function() {
    describe('Minionette.ModelView', function() {
        describe("instances", function() {
            beforeEach(function() {
                this.model = new Backbone.Model();
                this.view = new Minionette.ModelView({model: this.model});
            });
            afterEach(function() {
                this.model.destroy();
                this.view.remove();
                delete this.model;
                delete this.view;
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
                it("returns #model#attributes", function() {
                    this.model.set(_.uniqueId(), _.uniqueId());
                    var ret = this.view.serializeData();

                    expect(ret).to.deep.equal(this.model.attributes);
                });
            });
        });
    });
});
