Minionette.trigger = function trigger(event) {
    var method = 'on' + event.replace(/(?:^|:)(\w)/, function(_match, letter) {
        return letter.toUpperCase();
    });

    attempt(this, method, _.tail(arguments));

    return trigger._trigger.apply(this, arguments);
};
Minionette.trigger._trigger = Backbone.Events.trigger;
