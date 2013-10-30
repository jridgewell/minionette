describe('Minionette.CollectionView', function() {
    describe("instances", function() {
        beforeEach(function() {
            this.collection = new Backbone.Collection();
            this.view = new Minionette.CollectionView({collection: this.collection});
        });
        afterEach(function() {
            delete this.collection;
            delete this.view;
        });

        it("sets ModelView to an extended Minionette.ModelView", function() {
            expect(new this.view.ModelView()).to.be.instanceof(Minionette.ModelView);
        });

        it("Allows you to specify tagName and template for ModelView", function() {
            var opts = {template: function() { return 'hello!'; }, tagName: 'li'};
            var view = new Minionette.CollectionView({ModelView: opts});
            _.each(opts, function(val, key) {
                expect(view.ModelView.prototype[key]).to.equal(val);
            });
        });

        describe("Collection Events", function() {
            it("#render() on collection's 'reset' event", function() {
                expect(this.view.collectionEvents.reset).to.equal('render');
            });

            it("#render() on collection's 'sort' event", function() {
                expect(this.view.collectionEvents.sort).to.equal('render');
            });

            it("#removeOne() on collection's 'remove' event", function() {
                expect(this.view.collectionEvents.remove).to.equal('removeOne');
            });

            it("#addOne() on collection's 'add' event", function() {
                expect(this.view.collectionEvents.add).to.equal('addOne');
            });
        });

        describe("#modelViewEventPrefix", function() {
            it("uses 'modelView:' as prefix by default", function() {
                this.view.modelViewEventPrefix = 'modelView';
            });

            it("is changeable at any time", function() {
                var spy = this.sinon.spy();
                var view = this.view.addOne(new Backbone.Model());
                // Change modelViewEventPrefix AFTER adding the new model.
                this.view.modelViewEventPrefix = 'tester';
                this.view.on('tester:event', spy);

                view.trigger('event');

                expect(spy).to.have.been.called;
            });

            it("can be set to false, and event will have same name", function() {
                this.view.modelViewEventPrefix = false;
                var spy = this.sinon.spy();
                var view = this.view.addOne(new Backbone.Model());
                this.view.on('event', spy);

                view.trigger('event');

                expect(spy).to.have.been.called;
            });

            it("passes the modelView as the last param", function(done) {
                var view = this.view.addOne(new Backbone.Model());
                this.view.on('modelView:event', function(data, v) {
                    expect(data).to.equal(true);
                    expect(v).to.equal(v);
                    done();
                });

                view.trigger('event', true);
            });
        });

        describe("#render()", function() {
            it("triggers 'render' event", function() {
                var spy = this.sinon.spy();
                this.view.on('render', spy);

                this.view.render();

                expect(spy).to.have.been.calledWith(this.view);
            });

            it("triggers 'rendered' event", function() {
                var spy = this.sinon.spy();
                this.view.on('rendered', spy);

                this.view.render();

                expect(spy).to.have.been.calledWith(this.view);
            });

            it("removes old modelViews", function() {
                var view = this.view.addOne(new Backbone.Model()),
                spy = this.sinon.spy();
                view.on('remove', spy);

                this.view.render();

                expect(spy).to.have.been.called;
            });

            it("returns the view", function() {
                var ret = this.view.render();

                expect(ret).to.equal(this.view);
            });

            it("appends a modelView for each model in the collection", function() {
                var models = [
                    new Backbone.Model({id: _.uniqueId()}),
                    new Backbone.Model({id: _.uniqueId()}),
                    new Backbone.Model({id: _.uniqueId()})
                ];
                this.collection.add(models);
                var view = new (Minionette.CollectionView.extend({
                    tagName: 'p',
                    ModelView: Minionette.ModelView.extend({
                        template: _.template('<%= id %>')
                    })
                }))({collection: this.collection});

                view.render();

                expect(view.$el.text()).to.equal(_.pluck(models, 'id').join(''));
            });
        });

        describe("#appendHtml()", function() {
            beforeEach(function() {
                this.collection.add(new Backbone.Model());
                this.view.template = _.template('<p></p>');
            });

            it("just appends by default", function() {
                this.view.render();

                expect(this.view.$el).to.have.html('<p></p><div></div>');
            });

            it("can be overridden to put elements anywhere", function() {
                this.view.appendHtml = function(element) { this.$('p').append(element); };
                this.view.render();

                expect(this.view.$el).to.have.html('<p><div></div></p>');
            });
        });

        describe("#addOne()", function() {
            beforeEach(function() {
                this.model = new Backbone.Model();
            });
            afterEach(function() {
                delete this.model;
            });

            it("triggers 'addOne' event", function() {
                var spy = this.sinon.spy();
                this.view.on('addOne', spy);

                var view = this.view.addOne(this.model);

                expect(spy).to.have.been.calledWith(view);
            });

            it("triggers 'addedOne' event", function() {
                var spy = this.sinon.spy();
                this.view.on('addedOne', spy);

                var view = this.view.addOne(this.model);

                expect(spy).to.have.been.calledWith(view);
            });

            it("uses view constructed from #buildModelView()", function() {
                var v = new Minionette.View();
                this.view.buildModelView = function() {
                    return v;
                };
                var view = this.view.addOne(this.model);

                expect(view).to.equal(v);
            });

            it("returns the new modelView", function() {
                var view = this.view.addOne(this.model);

                expect(view).to.be.instanceOf(Backbone.View);
            });

            it("sets the new modelView's _parent to this", function() {
                var view = this.view.addOne(this.model);

                expect(view._parent).to.equal(this.view);
            });

            it("appends the new modelView's el to this.$el", function() {
                var view = this.view.addOne(this.model);

                expect(this.view.$el).to.have(view.$el);
            });

            it("sets up event forwarding", function() {
                var spy = this.sinon.spy();
                this.view.on('modelView:event', spy);
                var view = this.view.addOne(this.model);

                view.trigger('event');

                expect(spy).to.have.been.called;
            });
        });

        describe("#buildModelView()", function() {
            it("creates a view from ModelView", function() {
                var spy = this.sinon.spy(this.view, 'ModelView');

                this.view.addOne(new Backbone.Model());

                expect(spy).to.have.been.called;
            });
        });

        describe("#removeOne()", function() {
            beforeEach(function() {
                this.model = new Backbone.Model();
                this.modelView = this.view.addOne(this.model);
            });
            afterEach(function() {
                delete this.model;
                delete this.modelView;
            });

            it("triggers 'removeOne' event", function() {
                var spy = this.sinon.spy();
                this.view.on('removeOne', spy);

                this.view.removeOne(this.model);

                expect(spy).to.have.been.calledWith(this.modelView);
            });

            it("triggers 'removedOne' event", function() {
                var spy = this.sinon.spy();
                this.view.on('removedOne', spy);

                this.view.removeOne(this.model);

                expect(spy).to.have.been.calledWith(this.modelView);
            });

            it("calls #remove() on the view", function() {
                var spy = this.sinon.spy();
                this.modelView.on('remove', spy);

                this.view.removeOne(this.model);

                expect(spy).to.have.been.called;
            });

            it("removes event forwarding", function() {
                var spy = this.sinon.spy();
                this.view.on('modelView:event', spy);

                this.view.removeOne(this.model);
                this.modelView.trigger('event');

                expect(spy).to.not.have.been.called;
            });
        });

        describe("#remove()", function() {
            it("calls #remove() on the modelViews", function() {
                var spys = [];
                for (var i = 0; i < 5; ++i) {
                    var v = this.view.addOne(new Backbone.Model());
                    spys.push(this.sinon.spy(v, 'remove'));
                }

                this.view.remove();

                _.each(spys, function(spy) {
                    expect(spy).to.have.been.called;
                }, this);
                expect(this.view._modelViews).to.be.empty;
            });
        });
    });
});
