Minionette.trigger
==================

`Minionette.trigger` is meant to override `Backbone.Events.trigger` in
any evented class. It does the exact same thing as `Events.trigger`, as
well as calling the corresponding "on" method, when one is defined.
`trigger` is **not** included in any Minionette classes, by default.

Eg., when the "modelView:rendered" event happens, `trigger` will see if
the `#onModelViewRendered` is defined. If it is, it will be called with
the same arguments as the event listeners.

```javascript
var View = Minionette.View.extend({
    initialize: function() {
        this.on('event', this.event);
        this.on('other:event', this.justEvent);
    },

    // trigger must be manually mixed-in.
    trigger: Minionette.trigger,

    justEvent: function() {
        console.log('#justEvent');
    },

    event: function(x, y, z) {
        console.log('#event:', x, y, z);
    },

    onEvent: function(x, y, z) {
        console.log('#onEvent:', x, y, z);
    },

    onJustOn: function() {
        console.log('#onJustOn');
    }
});

var v = new View();

v.trigger('event', 1, 2, 3);
// Console: #onEvent 1 2 3
// Console: #event 1 2 3

v.trigger('other:event');
// Console: #justEvent

v.trigger('just:on');
// Console: #onJustOn
```
