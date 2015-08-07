import _ from 'underscore';
import Backbone from 'backbone';
import attempt from './attempt';

const eventSplitter = /\s+/;
const eventReplacer = /(^|:| )(\w)/g;
const trigger = Backbone.Events.trigger;

export default function(event, ...args) {
    // Morph the event string into the "on" method.
    // Supports space separated events.
    let method = 'on' + event.replace(eventReplacer, (_match, separator, letter) => {
        return (separator === ' ' ? ' on' : '') + letter.toUpperCase();
    });

    // Optimize the normal case (just one event).
    if (eventSplitter.test(method)) {
        _.each(method.split(eventSplitter), method => {
            attempt(this, method, args);
        });
    } else {
        attempt(this, method, args);
    }

    // Call the original trigger.
    return trigger.apply(this, arguments);
};
