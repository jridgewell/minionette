describe('Minionette.Router', function() {
    describe("instances", function() {
        var router, spy;
        beforeEach(function() {
            spy = sinon.spy();
            router = new Minionette.Router();
            Backbone.history.start();
        });
        afterEach(function() {
            Backbone.history.stop();
        });

        describe('#navigate', function() {
            beforeEach(function() {
                router.on('route', spy);
            });

            it('triggers route event', function() {
                router.route('test', 'controller/action', function() {});

                router.navigate('test', true);

                expect(spy).to.have.been.calledWith('controller/action');
            });

            it('passes router params to event', function() {
                router.route('test/:id/*splat', 'controller/action', function(){});

                router.navigate('test/er/ing/this', true);

                expect(spy).to.have.been.calledWith('controller/action', ['er', 'ing/this']);
            });
        });

        describe("Router Events", function() {
            beforeEach(function() {
                router.controller = {
                    action: spy
                };
            });

            it("parses route event into controller/action", function() {
                router.trigger('route', 'controller/action');

                expect(spy).to.have.been.called;
            });

            it("passes params as arguments to controller/action", function() {
                router.trigger('route', 'controller/action', [1, 2, 3]);

                expect(spy).to.have.been.calledWith(1, 2, 3);
            });
        });
    });
});
