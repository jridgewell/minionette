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
            it('triggers route event', function() {
                router.route('test', 'controller/action', function() {});
                router.on('route', spy);

                router.navigate('test', true);

                expect(spy).to.have.been.calledWith('controller/action');
            });

            it('passes router params to event', function() {
                router.route('test/:id/*splat', 'controller/action', function(){});
                router.on('route', spy);

                router.navigate('test/er/ing/this', true);

                expect(spy).to.have.been.calledWith('controller/action', ['er', 'ing/this']);
            });
        });

        describe("Router Events", function() {
            it("parses route event into controller/action", function() {
                router.controller = {
                    action: spy
                };

                router.trigger('route', 'controller/action');

                expect(spy).to.have.been.called;
            });

            it("passes params as arguments to controller/action", function() {
                router.controller = {
                    action: spy
                };

                router.trigger('route', 'controller/action', [1, 2, 3]);

                expect(spy).to.have.been.calledWith(1, 2, 3);
            });
        });
    });
});
