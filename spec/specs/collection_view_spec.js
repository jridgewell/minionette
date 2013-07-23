define(function() {
    describe('Minionette.CollectionView', function() {
        describe("instances", function() {
            beforeEach(function() {
                this.collection = new Backbone.Collection;
                this.view = new Minionette.CollectionView({collection: this.collection});
            });

            it("sets ModelView to Backbone.View", function() {
                expect(this.view.ModelView).to.equal(Backbone.View);
            });

            describe("Collection Events", function() {
                it("#render on collection's 'reset' event", function() {
                    expect(this.view.collectionEvents.reset).to.equal('render');
                });

                it("#removeOne on collection's 'remove' event", function() {
                    expect(this.view.collectionEvents.remove).to.equal('removeOne');
                });

                it("#addOne on collection's 'add' event", function() {
                    expect(this.view.collectionEvents.add).to.equal('addOne');
                });
            });

        });
    });
});
