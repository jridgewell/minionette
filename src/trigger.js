Minionette.trigger = function trigger(event) {
    var eventSplitter = /\s+/;
    var args = _.tail(arguments);

    if (eventSplitter.test(event)) {
        _.each(event.split(eventSplitter), function(event) {
            trigger.apply(this, [event].concat(args));
        }, this);
        return this;
    }

    var method = 'on' + event.replace(/(?:^|:)(\w)/, function(_match, letter) {
        return letter.toUpperCase();
    });

    attempt(this, method, args);

    return trigger._trigger.apply(this, arguments);
};
Minionette.trigger._trigger = Backbone.Events.trigger;
