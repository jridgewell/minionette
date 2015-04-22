var eventSplitter = /\s+/;
var eventReplacer = /(^|:| )(\w)/g;
var trigger = Backbone.Events.trigger;

Minionette.trigger = rest(function(event, args) {
    // Morph the event string into the "on" method.
    // Supports space separated events.
    var method = 'on' + event.replace(eventReplacer, function(_match, separator, letter) {
        return (separator === ' ' ? ' on' : '') + letter.toUpperCase();
    });

    // Optimize the normal case (just one event).
    if (eventSplitter.test(method)) {
        _.each(method.split(eventSplitter), function(method) {
            attempt(this, method, args);
        }, this);
    } else {
        if (_.isFunction(this[method])) {
            attempt(this, method, args, true);
        }
    }

    // Call the original trigger.
    return trigger.apply(this, arguments);
});
