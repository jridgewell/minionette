describe("Minionette.trigger()", function() {
    it("is not mixed in by default", function() {
        var Classes = _.functions(Minionette);
        _.each(Classes, function(Class) {
            expect(Class.trigger).not.to.equal(Minionette.trigger);
        });
    });

    describe("when used as a function", function() {
        var obj;
        beforeEach(function() {
            obj = _.extend({}, Backbone.Events);
        });

        it("calls 'onEvent' method", function() {
            var spy = obj.onEvent = sinon.spy();

            Minionette.trigger.call(obj, 'event');

            expect(spy).to.have.been.called;
        });

        it("passes event's arguments as params", function() {
            var spy = obj.onEvent = sinon.spy();

            Minionette.trigger.call(obj, 'event', 1, 2, 3);

            expect(spy).to.have.been.calledWith(1, 2, 3);
        });

        it("triggers event handlers as normal", function() {
            var spy = sinon.spy();
            obj.on('event', spy);

            Minionette.trigger.call(obj, 'event', 1, 2, 3);

            expect(spy).to.have.been.calledWith(1, 2, 3);
        });

        describe("when passed multiple space delimited events", function() {
            it("calls each on method", function() {
                var spy = obj.onEvent = sinon.spy();
                var spy2 = obj.onEvent2 = sinon.spy();

                Minionette.trigger.call(obj, 'event event2');

                expect(spy).to.have.been.called;
                expect(spy2).to.have.been.called;
            });

            it("passes event's arguments as params", function() {
                var spy = obj.onEvent = sinon.spy();
                var spy2 = obj.onEvent2 = sinon.spy();

                Minionette.trigger.call(obj, 'event event2', 1, 2, 3);

                expect(spy).to.have.been.calledWith(1, 2, 3);
                expect(spy2).to.have.been.calledWith(1, 2, 3);
            });

            it("triggers event handlers as normal", function() {
                var spy = sinon.spy();
                var spy2 = sinon.spy();
                obj.on('event', spy);
                obj.on('event2', spy2);

                Minionette.trigger.call(obj, 'event event2', 1, 2, 3);

                expect(spy).to.have.been.calledWith(1, 2, 3);
                expect(spy2).to.have.been.calledWith(1, 2, 3);
            });
        });
    });

    describe("when mixed in", function() {
        var obj;
        beforeEach(function() {
            obj = _.defaults({ trigger: Minionette.trigger }, Backbone.Events);
        });

        it("calls 'onEvent' method", function() {
            var spy = obj.onEvent = sinon.spy();

            obj.trigger('event');

            expect(spy).to.have.been.called;
        });

        it("passes event's arguments as params", function() {
            var spy = obj.onEvent = sinon.spy();

            obj.trigger('event', 1, 2, 3);

            expect(spy).to.have.been.calledWith(1, 2, 3);
        });

        it("triggers event handlers as normal", function() {
            var spy = sinon.spy();
            obj.on('event', spy);

            obj.trigger('event', 1, 2, 3);

            expect(spy).to.have.been.calledWith(1, 2, 3);
        });

        describe("when passed multiple space delimited events", function() {
            it("calls each on method", function() {
                var spy = obj.onEvent = sinon.spy();
                var spy2 = obj.onEvent2 = sinon.spy();

                obj.trigger('event event2');

                expect(spy).to.have.been.called;
                expect(spy2).to.have.been.called;
            });

            it("passes event's arguments as params", function() {
                var spy = obj.onEvent = sinon.spy();
                var spy2 = obj.onEvent2 = sinon.spy();

                obj.trigger('event event2', 1, 2, 3);

                expect(spy).to.have.been.calledWith(1, 2, 3);
                expect(spy2).to.have.been.calledWith(1, 2, 3);
            });

            it("triggers event handlers as normal", function() {
                var spy = sinon.spy();
                var spy2 = sinon.spy();
                obj.on('event', spy);
                obj.on('event2', spy2);

                obj.trigger('event event2', 1, 2, 3);

                expect(spy).to.have.been.calledWith(1, 2, 3);
                expect(spy2).to.have.been.calledWith(1, 2, 3);
            });
        });
    });
});
