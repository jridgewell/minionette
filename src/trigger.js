var eventSplitter = /\s+/;
var eventReplacer = /(^|:| )(\w)/g;

Minionette.trigger = function trigger(event) {
    // Morph the event string into the "on" method.
    // Supports space separated events.
    var method = 'on' + event.replace(eventReplacer, function(_match, separator, letter) {
        return (separator === ' ' ? ' on' : '') + letter.toUpperCase();
    });

    // Optimize the normal case (just one event).
    if (eventSplitter.test(method)) {
        var args = _.tail(arguments);
        _.each(method.split(eventSplitter), function(method) {
            attempt(this, method, args);
        }, this);
    } else {
        // Precheck if the method exists, so that we can
        // avoid the `arguments` leak de-opt if it doesn't.
        if (_.isFunction(this[method])) {
            attempt(this, method, _.tail(arguments), true);
        }
    }

    // Call the original trigger.
    // `_trigger` can be overridden if needed.
    return trigger._trigger.apply(this, arguments);
};
Minionette.trigger._trigger = Backbone.Events.trigger;
