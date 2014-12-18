Minionette.Model
====================

`Minionette.Model` is a base Model class, designed to work with
[Minionette.Computed](/docs/minionette.model.md). Any methods wrapped
inside a `Computed` will be called whenever a change event for the any
of the method's model dependencies happen. The computing method's return
value will be set to the attribute of the same name.

```javascript
var Dev = Minionette.Model.extend({
    defaults: {
        first: 'Jeremy',
        last: 'Ashkenas'
    },

    initialize: function() {
        console.log('Called #initialize');
        console.log(this.attributes);
    },

    name: Minionette.Computed('first', 'last', function() {
        console.log('Called #name');
        return this.get('first') + ' ' + this.get('last');
    })
});

var d = new Dev();
// Computed attributes are set before #initialize
// Console: Called #name
// Console: Called #initialize
// Console: { first: 'Jeremy', last: 'Ashkenas', name: 'Jeremy Ashkenas' }

d.set({ first: 'Test' });
// Console: Called #name
d.attributes // =>  { first: 'Test', last: 'Ashkenas', name: 'Test Ashkenas'}


d.set({ first: 'Backbone', last: 'Underscore' });
// Console: Called #name
// Console: Called #name
d.attributes // =>  { first: 'Backbone', last: 'Underscore', name: 'Backbone Underscore'}

d.trigger('change:first');
// Console: Called #name

```

## #toJSON()

By default, `Model`'s `#toJSON()` will omit any computed attributes.
There are two reasons for this behavior:

1. To save bandwidth when syncing with the server. Computed attributes
   should also be computed on the server, meaning sending them is
   unnecessary.
2. To discourage the use of `#toJSON()` when rendering a template.

```javascript
var d = new Dev();
d.toJSON(); // => { first: 'Jeremy', last: 'Ashkenas' }
```
