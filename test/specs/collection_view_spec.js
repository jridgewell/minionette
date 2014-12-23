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

        it("sets ModelView to an extended Minionette.ModelView", function() {
            expect(new view.ModelView()).to.be.instanceof(Minionette.ModelView);
        });

        it("does not set EmptyView by default", function() {
            expect(view.EmptyView).to.equal(undefined);
        });

        it("allows you to specify prototype for ModelView", function() {
            var opts = {template: function() { return 'hello!'; }, tagName: 'li'};
            view = new Minionette.CollectionView({ModelView: opts});
            _.each(opts, function(val, key) {
                expect(view.ModelView.prototype[key]).to.equal(val);
            });
        });

        it("allows you to specify prototype for EmptyView", function() {
            var opts = {template: function() { return 'hello!'; }, tagName: 'li'};
            view = new Minionette.CollectionView({EmptyView: opts});
            _.each(opts, function(val, key) {
                expect(view.EmptyView.prototype[key]).to.equal(val);
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

        describe("#initialize", function() {
            it("allows custom ModelView", function() {
                var ModelView = function() {};
                var cv = new (Minionette.CollectionView.extend({
                    initialize: function() {
                        this.ModelView = ModelView;
                    }
                }))();

                expect(cv.ModelView).to.equal(ModelView);
            });

            it("allows custom EmptyView", function() {
                var EmptyView = function() {};
                var cv = new (Minionette.CollectionView.extend({
                    initialize: function() {
                        this.EmptyView = EmptyView;
                    }
                }))();

                expect(cv.EmptyView).to.equal(EmptyView);
            });
        });

        describe("#modelViewEventPrefix", function() {
            var spy, modelView;
            beforeEach(function() {
                spy = sinon.spy();
                modelView = view.addOne(new Backbone.Model());
                view.on('all', spy);
            });

            it("uses 'modelView:' as prefix by default", function() {
                expect(view.modelViewEventPrefix).to.equal('modelView');
            });

            it("forwards all events under '{modelViewEventPrefix}:{eventName}'", function() {
                modelView.trigger('event');

                expect(spy).to.have.been.calledWith('modelView:event');
            });

            it("is changeable at any time", function() {
                // Change modelViewEventPrefix AFTER adding the new model.
                view.modelViewEventPrefix = 'tester';

                modelView.trigger('event');

                expect(spy).to.have.been.calledWith('tester:event');
            });

            it("can be set to false, and event will have same name", function() {
                view.modelViewEventPrefix = false;

                modelView.trigger('event');

                expect(spy).to.have.been.calledWith('event');
            });

            it("passes the modelView as the last param", function() {
                modelView.trigger('event', true);

                expect(spy).to.have.been.calledWith('modelView:event', true, modelView);
            });
        });

        describe("#render()", function() {
            beforeEach(function() {
                view.EmptyView = Minionette.View;
                view.ModelView = Minionette.ModelView.extend({
                    initialize: function(opts) {
                        opts.model.view = this;
                    }
                });
                collection.add([{}, {}, {}]);
            });

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

            it("triggers 'render' event before any DOM manipulations", function() {
                view.template = '<p></p>';
                var region = view.addRegion('subview', 'p');
                view.render();

                var mv = view.addOne(new Backbone.Model());

                view.on('render', function() {
                    expect(view.$el).to.have(region.view.$el);
                    expect(view.$el).to.have(mv.$el);
                });

                view.render();
            });

            it("triggers 'rendered' event after any DOM manipulations", function() {
                view.template = '<p></p>';
                view.render();

                var $p = view.$('p');
                var $mv = view.addOne(new Backbone.Model()).$el;

                view.on('rendered', function() {
                    expect(view.$el).not.to.have($p);
                    expect(view.$el).not.to.have($mv);
                });

                view.render();
            });

            it("detaches regions before emptying $el", function() {
                var subView = new Minionette.View(),
                spy = sinon.spy();
                subView.$el.on('click', spy);
                view.addRegion('subview', subView.render());
                view.template = '<div></div>'

                view.render();

                subView.$el.trigger('click');
                expect(spy).to.have.been.called;
            });

            it("passes #_serialize() output to #template()", function() {
                var stub = sinon.stub(view, 'template'),
                serialize = _.uniqueId();
                view._serialize = function() {
                    return serialize;
                };

                view.render();

                expect(stub).to.have.been.calledWith(serialize);
            });

            it("renders with output of #template", function() {
                template = _.uniqueId();
                view.template = function() {
                    return template;
                };

                view.render();

                expect(view.el.innerHTML).to.contain(template);
            });

            it("supports #template being a string", function() {
                view.template = 'test';

                view.render();

                expect(view.el.innerHTML).to.contain('test');
            });


            it("reattaches regions", function() {
                view.template = '<p></p>';
                view.addRegion('subview', 'p');
                view.render();

                var $v = view.subview.$el;

                view.render();

                expect(view.$el).to.have($v);
            });

            it("sets ui elements", function() {
                view.ui = {test: '.selector'};
                view.template = _.template('<p class="selector"></p>');

                view.render();

                expect(view.$test).to.be.an.instanceof(Backbone.$);
                expect(view.$test).to.match('.selector');
            });

            it("returns the view", function() {
                var ret = view.render();

                expect(ret).to.equal(view);
            });

            it("Integration Test", function() {
                var subView = new Minionette.View({tagName: 'span'});
                subView.template = _.template('subView');
                view.addRegion('subview', subView.render());
                view.template = _.template('<p>before</p><%= view("subview") %><p>after</p>');

                view.render();

                expect(view.el.innerHTML).to.equal('<p>before</p><span>subView</span><p>after</p><div></div><div></div><div></div>');
            });

            it("it renders models as modelViews", function() {

                view.render();

                collection.each(function(model) {
                    expect(view.$el).to.have(model.view.$el);
                });
            });

            it("creates documentFragment to efficiently append modelViews", function() {
                var spy = sinon.spy(view, 'appendModelViewFrag');

                view.render();

                expect(spy).to.have.been.called;
            });

            it("it appends documentFragment with #appendModelViewFrag", function() {
                var div = document.createElement('div');
                var spy = sinon.spy(view, 'appendModelViewFrag');
                view.buildDocumentFragment = function() {
                    return div;
                };

                view.render();

                expect(spy).to.have.been.calledWith(div);
                expect(view.$el).to.have(div);
            });

            it("it renders normally if #buildDocumentFragment returns false", function() {
                view.buildDocumentFragment = function() {};

                view.render();

                collection.each(function(model) {
                    expect(view.$el).to.have(model.view.$el);
                });
            });

            it("triggers 'addOne' event before any DOM manipulations", function() {
                view.on('addOne', function(mv) {
                    expect(view.$el).not.to.have(mv.$el);
                });

                view.render();
            });

            it("triggers 'addedOne' event after any DOM manipulations", function() {
                view.on('addedOne', function(mv) {
                    expect(view.$el).to.have(mv.$el);
                });

                view.render();
            });

            it("it removes old empty view", function() {
                collection.set([]);
                view.render();
                var emptyView = view.emptyView;
                var spy = sinon.spy(emptyView, 'remove');


                view.render();

                expect(spy).to.have.been.called;
            });

            it("it removes old modelViews", function() {
                view.render();
                var spies = collection.map(function(model) {
                    return sinon.spy(model.view, 'remove');
                });

                view.render();
                _.each(spies, function(spy) {
                    expect(spy).to.have.been.called;
                });
            });

            describe("when empty", function() {
                beforeEach(function() {
                    collection.set([]);
                });

                it("does not render empty view if EmptyView is false", function() {
                    view.EmptyView = null;

                    view.render();

                    expect(view.emptyView).to.equal(undefined);
                });

                it("renders empty view", function() {
                    view.render();

                    expect(view.$el).to.have(view.emptyView.$el);
                });

                it("uses view constructed from #buildEmptyView", function() {
                    var emptyView = new Minionette.View();
                    view.buildEmptyView = function() {
                        return emptyView;
                    }

                    view.render();

                    expect(view.$el).to.have(emptyView.$el);
                });

                it("forwards events from empty view", function() {
                    var spy = sinon.spy();
                    view.on('emptyView:event', spy);
                    view.render();

                    view.emptyView.trigger('event');

                    expect(spy).to.have.been.called;
                });
            });
        });

        describe("#appendModelView()", function() {
            beforeEach(function() {
                view.template = _.template('<p></p>');
                view.render();
            });

            it("just appends by default", function() {
                view.appendModelView(new Backbone.View());

                expect(view.$el).to.have.html('<p></p><div></div>');
            });

            it("can be overridden to put elements anywhere", function() {
                view.appendModelView = function(view) {
                    this.$('p').append(view.$el);
                };

                view.appendModelView(new Backbone.View());

                expect(view.$el).to.have.html('<p><div></div></p>');
            });
        });

        describe("#buildDocumentFragment", function() {
            it("it returns a new documentFragment", function() {
                var frag = {};
                sinon.stub(document, 'createDocumentFragment', function() {
                    return frag;
                });

                expect(view.buildDocumentFragment()).to.equal(frag);
            });
        });

        describe("#appendModelViewFrag", function() {
            var el;
            beforeEach(function() {
                view.template = _.template('<p></p>');
                view.render();
                el = document.createElement('div');
            });

            it("just appends by default", function() {
                view.appendModelViewFrag(el);

                expect(view.$el).to.have.html('<p></p><div></div>');
            });

            it("can be overridden to put elements anywhere", function() {
                view.appendModelViewFrag = function(frag) {
                    this.$('p').append(frag);
                };

                view.appendModelViewFrag(el);

                expect(view.$el).to.have.html('<p><div></div></p>');
            });
        });

        describe("#appendModelViewToFrag", function() {
            var frag, $el;
            beforeEach(function() {
                $el = $('<p/>');
                frag = view.modelViewsFrag = view.buildDocumentFragment();
            });

            it("just appends by default", function() {
                view.appendModelViewToFrag(new Backbone.View());

                $el.append(frag);
                expect($el).to.have.html('<div></div>');
            });

            it("can be overridden to put elements anywhere", function() {
                view.appendModelViewToFrag = function(view) {
                    var div = this.modelViewsFrag.childNodes[0];
                    if (div) {
                        div.appendChild(view.el);
                    } else {
                        this.modelViewsFrag.appendChild(view.el);
                    }
                };

                view.appendModelViewToFrag(new Backbone.View());
                view.appendModelViewToFrag(new Backbone.View({tagName: 'span'}));

                $el.append(frag);
                expect($el).to.have.html('<div><span></span></div>');
            });
        });

        describe("#addOne()", function() {
            var model;
            beforeEach(function() {
                model = new Backbone.Model();
            });

            it("removes empty view", function() {
                view.EmptyView = Minionette.View;
                view.render();
                var spy = sinon.spy(view.emptyView, 'remove');

                view.addOne(model);

                expect(spy).to.have.been.called;
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

            it("triggers 'addOne' event before any DOM manipulations", function() {
                view.on('addOne', function(mv) {
                    expect(view.$el).not.to.have(mv.$el);
                });

                view.addOne(model);
            });

            it("triggers 'addedOne' event after any DOM manipulations", function() {
                view.on('addedOne', function(mv) {
                    expect(view.$el).to.have(mv.$el);
                });

                view.addOne(model);
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
                var mv = view.buildModelView(null);

                expect(mv).to.be.instanceof(view.ModelView);
            });

            it("passes model as model property of options", function() {
                var model = {};
                var spy = sinon.stub(view, 'ModelView');

                view.buildModelView(model);

                expect(spy).to.have.been.calledWith({ model: model});
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

            it("triggers 'removeOne' event before any DOM manipulations", function() {
                view.on('removeOne', function(mv) {
                    expect(view.$el).to.have(mv.$el);
                });

                view.removeOne(model);
            });

            it("triggers 'removeedOne' event after any DOM manipulations", function() {
                view.on('removeedOne', function(mv) {
                    expect(view.$el).not.to.have(mv.$el);
                });

                view.removeOne(model);
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

            describe("when empty", function() {
                it("does not render empty view if EmptyView is false", function() {
                    view.EmptyView = null;

                    view.render();

                    expect(view.emptyView).to.equal(undefined);
                });

                it("renders empty view if empty", function() {
                    view.EmptyView = Minionette.View;
                    view.removeOne(model);

                    expect(view.$el).to.have(view.emptyView.$el);
                });

                it("does not pave over empty view", function() {
                    view.EmptyView = Minionette.View;
                    view.removeOne(model);
                    var emptyView = view.emptyView;

                    view.removeOne(model);

                    expect(view.emptyView).to.equal(emptyView);
                });
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

            it("calls #remove() on the emptyView", function() {
                view.EmptyView = Minionette.View;
                view.render();
                var spy = sinon.spy(view.emptyView, 'remove');

                view.remove();

                expect(spy).to.have.been.called;
            });

            it("triggers 'remove' event", function() {
                var spy = sinon.spy();
                view.on('remove', spy);

                view.remove();

                expect(spy).to.have.been.calledWith(view);
            });

            it("triggers 'removed' event", function() {
                var spy = sinon.spy();
                view.on('removed', spy);

                view.remove();

                expect(spy).to.have.been.calledWith(view);
            });

            it("triggers 'remove' event before any DOM manipulations", function() {
                view.template = '<p></p>';
                var region = view.addRegion('subview', 'p');
                view.render();

                var mv = view.addOne(new Backbone.Model());

                view.on('remove', function() {
                    expect(view.$el).to.have(region.view.$el);
                    expect(view.$el).to.have(mv.$el);
                });

                view.remove();
            });

            it("triggers 'removed' event after any DOM manipulations", function() {
                view.template = '<p></p>';
                var region = view.addRegion('subview', 'p');
                view.render();

                var $r = view.subview.$el;
                var $mv = view.addOne(new Backbone.Model()).$el;

                view.on('removed', function() {
                    expect(view.$el).not.to.have($r);
                    expect(view.$el).not.to.have($mv);
                });

                view.remove();
            });

            it("triggers subview's 'remove' event before any DOM manipulations", function() {
                view.template = '<p></p>';
                var region = view.addRegion('subview', 'p');
                view.render();
                var mv = view.addOne(new Backbone.Model());

                var $wrapper = $('<div>').append(view.$el);

                region.on('remove', function() {
                    expect($wrapper).to.have(region.view.$el);
                });
                mv.on('remove', function() {
                    expect($wrapper).to.have(mv.$el);
                });

                view.remove();
            });

            it("triggers subviews 'removed' event after any DOM manipulations", function() {
                view.template = '<p></p>';
                var region = view.addRegion('subview', 'p');
                view.render();
                var mv = view.addOne(new Backbone.Model());

                var $wrapper = $('<div>').append(view.$el);
                var $r = region.view.$el;
                var $mv = mv.$el;

                region.on('removed', function() {
                    expect($wrapper).not.to.have($r);
                });
                mv.on('removed', function() {
                    expect($wrapper).not.to.have($mv);
                });

                view.remove();
            });

            it("removes from parent view", function() {
                var subView = new Minionette.View();
                view.addRegion('subview', subView);

                subView.remove();

                expect(view.subview).not.to.equal(subView);
            });

            it("removes regions", function() {
                var spys = [];

                for (var i = 0; i < 5; ++i) {
                    var v = new Minionette.View();
                    spys.push(sinon.spy(v, 'remove'));
                    view.addRegion('subview' + i, v);
                }

                view.remove();

                _.each(spys, function(spy) {
                    expect(spy).to.have.been.called;
                }, this);
                expect(view._regions).to.be.empty;
            });

            it("returns the view", function() {
                var ret = view.remove();

                expect(ret).to.equal(view);
            });
        });
    });
});
