describe('Minionette.Model', function() {
    var Model = Minionette.Model.extend({
        name: Minionette.Computed('first', 'last', function() {
            return [this.get('first'), this.get('last')].join(' ');
        })
    });
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
                expect(Model.prototype._computedProperties).to.deep.equal(['name']);
            });

            it("falls back to instance", function() {
                var Child = Model.extend({});
                Child.prototype.constructor = null;

                model = new Child();

                expect(_.has(Child.prototype, '_computedProperties')).to.equal(false);
                expect(model._computedProperties).to.deep.equal(['name']);
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
});
