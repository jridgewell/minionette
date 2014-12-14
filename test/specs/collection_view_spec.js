describe('Minionette.CollectionView', function() {
    describe("constructor", function() {
        it("does not error when instance without options", function() {
            expect(new Minionette.CollectionView()).to.be.instanceof(Minionette.CollectionView);
        });
    });

    describe("instances", function() {
        var collection, view;
        beforeEach(function() {
            collection = new Backbone.Collection();
            view = new Minionette.CollectionView({collection: collection});
        });

        it("sets ModelView to an extended Minionette.ModelView", function() {
            expect(new view.ModelView()).to.be.instanceof(Minionette.ModelView);
        });

        it("Allows you to specify tagName and template for ModelView", function() {
            var opts = {template: function() { return 'hello!'; }, tagName: 'li'};
            view = new Minionette.CollectionView({ModelView: opts});
            _.each(opts, function(val, key) {
                expect(view.ModelView.prototype[key]).to.equal(val);
            });
        });

        describe("Collection Events", function() {
            it("#render() on collection's 'reset' event", function() {
                expect(view.collectionEvents.reset).to.equal('render');
            });

            it("#render() on collection's 'sort' event", function() {
                expect(view.collectionEvents.sort).to.equal('render');
            });

            it("#removeOne() on collection's 'remove' event", function() {
                expect(view.collectionEvents.remove).to.equal('removeOne');
            });

            it("#addOne() on collection's 'add' event", function() {
                expect(view.collectionEvents.add).to.equal('addOne');
            });
        });

        describe("#modelViewEventPrefix", function() {
            it("uses 'modelView:' as prefix by default", function() {
                view.modelViewEventPrefix = 'modelView';
            });

            it("is changeable at any time", function() {
                var spy = sinon.spy();
                var v = view.addOne(new Backbone.Model());
                // Change modelViewEventPrefix AFTER adding the new model.
                view.modelViewEventPrefix = 'tester';
                view.on('tester:event', spy);

                v.trigger('event');

                expect(spy).to.have.been.called;
            });

            it("can be set to false, and event will have same name", function() {
                view.modelViewEventPrefix = false;
                var spy = sinon.spy();
                var v = view.addOne(new Backbone.Model());
                view.on('event', spy);

                v.trigger('event');

                expect(spy).to.have.been.called;
            });

            it("passes the modelView as the last param", function(done) {
                var v = view.addOne(new Backbone.Model());
                view.on('modelView:event', function(data, view) {
                    expect(data).to.equal(true);
                    expect(view).to.equal(v);
                    done();
                });

                v.trigger('event', true);
            });
        });

        describe("#render()", function() {
            it("triggers 'render' event", function() {
                var spy = sinon.spy();
                view.on('render', spy);

                view.render();

                expect(spy).to.have.been.calledWith(view);
            });

            it("triggers 'rendered' event", function() {
                var spy = sinon.spy();
                view.on('rendered', spy);

                view.render();

                expect(spy).to.have.been.calledWith(view);
            });

            it("removes old modelViews", function() {
                var v = view.addOne(new Backbone.Model()),
                spy = sinon.spy();
                v.on('remove', spy);

                view.render();

                expect(spy).to.have.been.called;
            });

            it("returns the view", function() {
                var ret = view.render();

                expect(ret).to.equal(view);
            });

            it("appends a modelView for each model in the collection", function() {
                var models = [
                    new Backbone.Model({id: _.uniqueId()}),
                    new Backbone.Model({id: _.uniqueId()}),
                    new Backbone.Model({id: _.uniqueId()})
                ];
                collection.add(models);
                view = new (Minionette.CollectionView.extend({
                    tagName: 'p',
                    ModelView: Minionette.ModelView.extend({
                        template: _.template('<%= id %>')
                    })
                }))({collection: collection});

                view.render();

                expect(view.$el.text()).to.equal(_.pluck(models, 'id').join(''));
            });
        });

        describe("#appendModelView()", function() {
            beforeEach(function() {
                view.template = _.template('<p></p>');
            });

            it("just appends by default", function() {
                view.render();
                collection.add({});

                expect(view.$el).to.have.html('<p></p><div></div>');
            });

            it("can be overridden to put elements anywhere", function() {
                view.appendModelView = function(view) { this.$('p').append(view.$el); };
                view.render();

                collection.add({});

                expect(view.$el).to.have.html('<p><div></div></p>');
            });
        });

        describe("#addOne()", function() {
            var model;
            beforeEach(function() {
                model = new Backbone.Model();
            });

            it("triggers 'addOne' event", function() {
                var spy = sinon.spy();
                view.on('addOne', spy);

                var v = view.addOne(model);

                expect(spy).to.have.been.calledWith(v);
            });

            it("triggers 'addedOne' event", function() {
                var spy = sinon.spy();
                view.on('addedOne', spy);

                var v = view.addOne(model);

                expect(spy).to.have.been.calledWith(v);
            });

            it("uses view constructed from #buildModelView()", function() {
                var v = new Minionette.View();
                view.buildModelView = function() {
                    return v;
                };
                var nv = view.addOne(model);

                expect(nv).to.equal(v);
            });

            it("returns the new modelView", function() {
                var v = view.addOne(model);

                expect(v).to.be.instanceOf(Backbone.View);
            });

            it("sets the new modelView's _parent to this", function() {
                var v = view.addOne(model);

                expect(v._parent).to.equal(view);
            });

            it("appends the new modelView's el to this.$el", function() {
                var v = view.addOne(model);

                expect(view.$el).to.have(v.$el);
            });

            it("sets up event forwarding", function() {
                var spy = sinon.spy();
                view.on('modelView:event', spy);
                var v = view.addOne(model);

                v.trigger('event');

                expect(spy).to.have.been.called;
            });
        });

        describe("#buildModelView()", function() {
            it("creates a view from ModelView", function() {
                var spy = sinon.spy(view, 'ModelView');

                view.addOne(new Backbone.Model());

                expect(spy).to.have.been.called;
            });
        });

        describe("#removeOne()", function() {
            var model, modelView;
            beforeEach(function() {
                model = new Backbone.Model();
                modelView = view.addOne(model);
            });

            it("triggers 'removeOne' event", function() {
                var spy = sinon.spy();
                view.on('removeOne', spy);

                view.removeOne(model);

                expect(spy).to.have.been.calledWith(modelView);
            });

            it("triggers 'removedOne' event", function() {
                var spy = sinon.spy();
                view.on('removedOne', spy);

                view.removeOne(model);

                expect(spy).to.have.been.calledWith(modelView);
            });

            it("calls #remove() on the view", function() {
                var spy = sinon.spy();
                modelView.on('remove', spy);

                view.removeOne(model);

                expect(spy).to.have.been.called;
            });

            it("removes event forwarding", function() {
                var spy = sinon.spy();
                view.on('modelView:event', spy);

                view.removeOne(model);
                modelView.trigger('event');

                expect(spy).to.not.have.been.called;
            });

            it("will not remove any view for a model it is not tracking", function() {
                model = new Backbone.Model();
                modelView = new Minionette.ModelView({ model: model });
                var spy = sinon.spy(modelView, 'remove');

                view.removeOne(model);

                expect(spy).not.to.have.been.called;
            });
        });

        describe("#remove()", function() {
            it("calls #remove() on the modelViews", function() {
                var spys = [];
                for (var i = 0; i < 5; ++i) {
                    var v = view.addOne(new Backbone.Model());
                    spys.push(sinon.spy(v, 'remove'));
                }

                view.remove();

                _.each(spys, function(spy) {
                    expect(spy).to.have.been.called;
                }, this);
                expect(view._modelViews).to.be.empty;
            });
        });
    });
});
