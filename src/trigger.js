var eventSplitter = /\s+/;
var eventReplacer = /(^|:| )(\w)/g;

Minionette.trigger = function trigger(event) {
    var method = 'on' + event.replace(eventReplacer, function(_match, separator, letter) {
        return (separator === ' ' ? ' on' : '') + letter.toUpperCase();
    });

    if (eventSplitter.test(method)) {
        var args = _.tail(arguments);
        _.each(method.split(eventSplitter), function(method) {
            attempt(this, method, args);
        }, this);
    } else {
        if (_.isFunction(this[method])) {
            attempt(this, method, _.tail(arguments), true);
        }
    }

    return trigger._trigger.apply(this, arguments);
};
Minionette.trigger._trigger = Backbone.Events.trigger;
