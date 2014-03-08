Minionette.CollectionView
=========================

`Minionette.CollectionView` is an optimized
[Minionette.View](/docs/minionette.view.md) for your Backbone
collections. It quickly handles rendering using a DocumentFragment,
ensuring at most three content reflows. The most important feature of
`CollectionView` is the `#ModelView` property, from which all models
will have a view instantiated from. Additionally, it will forward a
modelView's events, prefixed by `#modelViewEventPrefix`, for easy event
listening directly on the collectionView.


## #ModelView

The `#ModelView` property should be the View class that you wish for all
your modelViews to be rendered as.

Alternatively, you may specify a properties object, which will be passed
into the `#extend()` method of `Minionette.ModelView`. This allows you
to easily define a #ModelView without declaring a class.

```javascript
var CV = Minionette.CollectionView.extend({
    template: function() { /* the collectionView template */ },
    tagName: 'ul', // The collectionView tagName,

    // ...

    ModelView: { // Specify a properties object to extend ModelView with
        template: function() { /* the modelView template */ },
        tagName: 'li', // The modelView tagName,
    }
});
```


## #collectionEvents

```javascript
collectionEvents = {
    add: 'addOne',
    remove: 'removeOne',
    reset: 'render',
    sort: 'render'
};
```

`CollectionView` will listen for the default collection events,
rendering the appropriate function to keep things speedy.


## #modelViewEventPrefix = 'modelView'

`CollectionView` listens to all events triggered by instantiated
modelView's and will forward them. By default, `#modelViewEventPrefix`
is the string "modelView", meaning an event "test" triggered by a
modelView will be forwarded as "modelView:test" by the collectionView.
Setting `#modelViewEventPrefix` to a false-y value will cause events to
be forwarded without a prefix, so that "test" will be forwarded as
"test" by the collectionView.

Additionally, the collectionView will append itself as the final
argument passed to the event listeners.

```javascript
var CV = Minionette.CollectionView.extend({
    modelViewEventPrefix: 'prefix'
});

var cv = new CV({collection: new Backbone.Collection()});
cv.on('prefix:render', function(modelView, collectionView) {
    // do stuff...
});
cv.collection.add({});  // above event listener will be fired,
                        // adding a model creates a modelView and renders it.
```


## #render()

The `#render()` method augments `Minionette.View`'s
[#render()](/docs/minionette.view.md#render) with the collection
specific rendering. It will remove all previously associated modelViews,
and render the new ones inside a DocumentFragment, which will be
appended to the collectionView's $el.


## #addOne(model)

`#addOne()` creates a new modelView by calling
[#buildModelView()](#buildmodelviewmodel). It then renders that
modelView, and passes it's `$el` to [#appendModelView()](#appendhtmlelement).

### #buildModelView(model)

`#buildModelView()` creates a new instance of #ModelView, and returns
it. It's helpful to override this method if you need to pass custom data
during the construction of the instance.

```javascript
var CV = Minionette.CollectionView.extend({
    buildModelView: function(model) {
        return new this.ModelView({model: model, custom: 'options'});
    }
});
```

### #appendModelView($element)

`#appendModelView()`, by default, takes the passed in element and appends it
to the collectionView's $el. Override this method to append elements to
to specific spots in the collectionView's $el.

```javascript
var CV = Minionette.CollectionView.extend({
    tagName: 'div',
    template: _.template('<ul><li>last</li></ul>'),
    appendModelView: function($element) {
       this.$('ul :last-child').before($element); 
    }
});
```

### "addOne" Event

The "addOne" event is fired after instantiating the modelView, and is
passed that modelView and the collectionView as argumentss.

### "addedOne" Event

The "addedOne" event is fired after rendering the modelView and adding
it to the collectionView's $el, and is passed that modelView and the
collectionView as it's arguments.


## #removeOne(model)

`#removeOne()` attempts to find the view associated with the removed
`model`, and calls `#remove()` on it.

### "removeOne" Event

The "removeOne" event is fired before calling `#remove()` on the view,
and is passed that modelView and the collectionView as it's arguments.

### "removedOne" Event

The "removedOne" event is fired after calling `#remove()` on the view,
and is passed that modelView and the collectionView as it's arguments.


## #remove()

`CollectionView` augments `Minionette.View`'s [#remove()](/docs/minionette.view.md#remove) method to make
sure all associated modelViews are `#remove()`ed.
