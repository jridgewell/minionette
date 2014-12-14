describe('Minionette.Model', function() {
    var proto = {
        name: Minionette.Computed('first', 'last', function() {
            return [this.get('first'), this.get('last')].join(' ');
        }),
        other: Minionette.Computed('first', function() {
            return this.get('first');
        })
    };
    var Model = Minionette.Model.extend(proto);
    var model;
    beforeEach(function() {
        model = new Model({first: 'first', last: 'last'});
    });

    describe("constructor", function() {
        describe("finds computed properties", function() {
            it("sets up event listeners", function() {
                var spy = sinon.spy(model, 'name');

                model.set('first', 'test');

                expect(spy).to.have.been.calledOnce;
            });

            it("finds computed properties from parent class", function() {
                var Child = Model.extend();
                model = new Child();
                var spy = sinon.spy(model, 'name');

                model.set('first', 'test');

                expect(spy).to.have.been.called;
            });
        });

        describe("caches computed property property names", function() {
            it("caches property names on prototype", function() {
                expect(Model.prototype._computedProperties).to.deep.equal(_.methods(proto));
            });

            it("falls back to instance", function() {
                var Child = Model.extend({});
                Child.prototype.constructor = null;

                model = new Child();

                expect(_.has(Child.prototype, '_computedProperties')).to.equal(false);
                expect(model._computedProperties).to.deep.equal(_.methods(proto));
            });
        });

        it("sets computed properties before #initialize is called", function() {
            var name;
            var Child = Model.extend({
                initialize: function() {
                    name = this.get('name');
                }
            });

            model = new Child();

            expect(name).to.equal(model.name());
        });

        it("sets computed properties with constructor options", function() {
            var spy = sinon.spy();
            var Child = Model.extend({
                _validate: spy
            });

            model = new Child({}, {parse: true});

            expect(spy).to.have.been.calledTwice;
            expect(spy.getCall(0).args[1]).to.deep.equal({parse: true});
        });
    });

    describe("instances", function() {
        describe("#toJSON", function() {
            it('omits computed properties', function() {
                var json = model.toJSON();

                expect(json).not.to.have.keys(['name']);
            });
        });
    });

    describe("#set", function() {
        describe("when changing computed property's dependent property", function() {
            it("updates computed property", function() {
                model.set('first', 'test');

                expect(model.get('name')).to.equal('test last');
            });

            it("updates correctly when multiple dependencies change", function() {
                model.set({
                    first: 'test',
                    last: 'test'
                });

                expect(model.get('name')).to.equal('test test');
            });

            it("only changes computed property once", function() {
                var spy = sinon.spy();
                model.on('change:name', spy);

                model.set({
                    first: 'test',
                    last: 'test'
                });

                expect(spy).to.have.been.calledOnce;
            });
        });

        describe("when changing unrelated dependent property", function() {
            it("does not update computed property", function() {
                var spy = sinon.spy(model, 'other');

                model.set('last', 'test');

                expect(spy).not.to.have.been.called;
            });
        });
    });
});
