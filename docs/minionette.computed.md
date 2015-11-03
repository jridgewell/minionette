Minionette.Computed
===================

`Minionette.Computed` is a helper function, designed to specify the
attributes a Model's method depends on for its result. When used in
conjunction with [Minionette.Model](/docs/minionette.model.md), any time
a dependent attribute changes, the computing function will be called.
Its return value is then set onto the model's attributes, using the same
name as the method.

```javascript
var Model = Minionette.Model.extend({
    defaults: {
        first: 'Jeremy',
        last: 'Ashkenas'
    },

    initialize: function() {
        console.log(this.attributes);
    },

    name: Minionette.Computed('first', 'last', function() {
        return this.get('first') + ' ' + this.get('last');
    })
});

var m = new Model();
// Computed attributes are set before #initialize
// Console: { first: 'Jeremy', last: 'Ashkenas', name: 'Jeremy Ashkenas' }

m.name(); // => 'Jeremy Ashkenas'
m.attributes // =>  { first: 'Jeremy', last: 'Ashkenas', name: 'Jeremy Ashkenas'}


m.set({ first: 'Test' });

m.name(); // => 'Test Ashkenas'
m.attributes // =>  { first: 'Test', last: 'Ashkenas', name: 'Test Ashkenas'}


m.set({ first: 'Backbone', last: 'Underscore' });

m.name(); // => 'Backbone Underscore'
m.attributes // =>  { first: 'Backbone', last: 'Underscore', name: 'Backbone Underscore'}

```
