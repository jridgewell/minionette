describe('Minionette.ModelView', function() {
    describe("instances", function() {
        var model, view;
        beforeEach(function() {
            model = new Backbone.Model();
            view = new Minionette.ModelView({model: model});
        });

        describe("Model Events", function() {
            it("#render() on model's 'change' event", function() {
                expect(view.modelEvents.change).to.equal('render');
            });

            it("#remove() on model's 'destroy' event", function() {
                expect(view.modelEvents.destroy).to.equal('remove');
            });
        });

        describe("#serialize()", function() {
            it("returns #model#attributes", function() {
                model.set(_.uniqueId(), _.uniqueId());
                var ret = view.serialize();

                expect(ret).to.deep.equal(model.attributes);
            });
        });
    });
});
