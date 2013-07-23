define(function() {
    describe('Minionette.CollectionView', function() {
        describe("instances", function() {
            beforeEach(function() {
                this.collection = new Backbone.Collection();
                this.view = new Minionette.CollectionView({collection: this.collection});
            });

            it("sets ModelView to Backbone.View", function() {
                expect(this.view.ModelView).to.equal(Backbone.View);
            });

            describe("Collection Events", function() {
                it("#render on collection's 'reset' event", function() {
                    expect(this.view.collectionEvents.reset).to.equal('render');
                });

                it("#render on collection's 'sort' event", function() {
                    expect(this.view.collectionEvents.sort).to.equal('render');
                });

                it("#removeOne on collection's 'remove' event", function() {
                    expect(this.view.collectionEvents.remove).to.equal('removeOne');
                });

                it("#addOne on collection's 'add' event", function() {
                    expect(this.view.collectionEvents.add).to.equal('addOne');
                });
            });

            describe("#render", function() {
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

                it("appends a modelView for each model in the collection", function() {
                    var models = [
                        new Backbone.Model({id: _.uniqueId()}),
                        new Backbone.Model({id: _.uniqueId()}),
                        new Backbone.Model({id: _.uniqueId()})
                    ];
                    var view = new (Minionette.CollectionView.extend({
                        ModelView: Minionette.ModelView.extend({
                            template: function(model) {return '<p>' + model.id + '</p>';}
                        })
                    }))({collection: this.collection});
                    this.collection.add(models);
                    view.$el.empty();

                    view.render();

                    expect(view.$el.text()).to.equal(_.pluck(models, 'id').join(''));
                });
            });

            describe("#addOne", function() {
                beforeEach(function() {
                    this.model = new Backbone.Model();
                });

                it("triggers 'addOne:before' event", function() {
                    var spy = this.sinon.spy();
                    this.view.on('addOne:before', spy);

                    this.view.addOne(this.model);

                    expect(spy).to.have.been.called;
                });

                it("triggers 'addOne' event", function() {
                    var spy = this.sinon.spy();
                    this.view.on('addOne', spy);

                    this.view.addOne(this.model);

                    expect(spy).to.have.been.called;
                });

                it("creates a view from ModelView", function() {
                    var spy = this.sinon.spy(Backbone, 'View'),
                        view = new Minionette.CollectionView({collection: this.collection});

                    view.addOne(this.model);

                    expect(spy).to.have.been.called;
                });

                it("returns the new modelView", function() {
                    var view = this.view.addOne(this.model);

                    expect(view).to.be.instanceOf(Backbone.View);
                });

                it("add the new modelView to _subViews", function() {
                    // TODO: Knows too much
                    var view = this.view.addOne(this.model);

                    expect(this.view._subViews[view.cid]).to.equal(view);
                });

                it("sets the new modelView's _parentView to this", function() {
                    var view = this.view.addOne(this.model);

                    expect(view._parentView).to.equal(this.view);
                });

                it("appends the new modelView's el to this.$el", function() {
                    var view = this.view.addOne(this.model);

                    expect(this.view.$(view.el)[0]).to.equal(view.el);
                });
            });

            describe("#removeOne", function() {
                beforeEach(function() {
                    this.model = new Backbone.Model();
                    this.modelView = this.view.addOne(this.model);
                });

                it("triggers 'removeOne:before' event", function() {
                    var spy = this.sinon.spy();
                    this.view.on('removeOne:before', spy);

                    this.view.removeOne(this.model);

                    expect(spy).to.have.been.called;
                });

                it("triggers 'removeOne' event", function() {
                    var spy = this.sinon.spy();
                    this.view.on('removeOne', spy);

                    this.view.removeOne(this.model);

                    expect(spy).to.have.been.called;
                });

                it("returns the removed view", function() {
                    var ret = this.view.removeOne(this.model);

                    expect(ret).to.equal(this.modelView);
                });

                it("calls #remove on the view", function() {
                    var spy = this.sinon.spy(this.modelView, 'remove');

                    this.view.removeOne(this.model);

                    expect(spy).to.have.been.called;
                });
            });

            describe("#_getModelView", function() {
                beforeEach(function() {
                    this.View = Minionette.CollectionView.extend({
                        ModelView: 'DefaultModelView'
                    });
                });

                it("returns this#ModelView", function() {
                    var view = new this.View();
                    expect(view._getModelView()).to.equal('DefaultModelView');
                });

                it("returns ModelView passed in at instantiation", function() {
                    var view = new this.View({ModelView: 'instantiation'});
                    expect(view._getModelView()).to.equal('instantiation');
                });
            });
        });
    });
});
