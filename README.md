Minionette
==========

A mini Marionette for Backbone.js

Minionette provides three highly optimized View classes for you to use,
`Minionette.View`, `Minionette.ModelView`, and
`Minionette.CollectionView`.

Minionette.View
---------------


* * * * * * * 

Minionette.Region
-----------------


* * * * * * * 

Minionette.ModelView
--------------------

`Minionette.ModelView` is nothing more than `Minionette.View` with two
defaults programmed in, `modelEvents` and `#serialize()`.

### #modelEvents

```javascript
modelEvents = {
    change: 'render',
    destroy: 'remove'
};
```

By default, `ModelView` will listen to the `change` event on the model,
and re-render. It will also listen for the `destroy` event, and will
remove itself.

### #serialize()

`ModelView`'s `#serialize()` does nothing more than returning
`this.model.attributes`, ready to be passed into `#template()`.


* * * * * * * 

Minionette.CollectionView
-------------------------

`Minionette.CollectionView` is an optimized `Minionette.View` for your
Backbone collections. It quickly handles rendering using a
DocumentFragment, ensuring at most two content reflows. The most
important feature of `CollectionView` is the `#ModelView` property, from
which all models will have a view instantiated from. Additionally,
`CollectionView` handles memory management for you: calling `#remove()`
will `#remove()` all modelViews.

### #ModelView

The `#ModelView` property should be the View class that you wish for all
your modelViews to be rendered as.

### #collectionEvents

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

### #render()

`#render()` calls `#remove()` on all previously rendered modelViews. It
then renders all of the collection's models as `#ModelView`s inside of a
DocumentFragment, which it appends to the freshly `#template()`ed
`$el`.

#### Events:

##### "render"

The "render" event is fired at the beginning of the `#render()` method,
before any DOM modelViews have been removed or any DOM changes. Listen
for this event to augment the `#render()` method without overriding it.

### #addOne(model)

`#addOne()` instantiates a new `#ModelView` with `{model: model}`. It
then renders that modelView, and appends it's `$el` to the
collectionView's `$el`.

#### Events:

##### "addOne"

The "addOne" event is fired after instantiating the modelView, and is
passed that modelView as it's only argument.

### #removeOne(model)

`#removeOne()` attempts to find the view associated with the removed
model, and calls `#remove()` on it.

#### Events:

##### "removeOne"

The "removeOne" event is fired before calling `#remove()` on the view,
and is passed that view as it's only argument.

### #remove()

`CollectionView` augments `Minionette.View`'s `#remove()` method to make
sure all associated modelViews are `#remove()`ed.
