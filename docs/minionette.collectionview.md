Minionette.CollectionView
=========================

`Minionette.CollectionView` is an optimized `Minionette.View` for your
Backbone collections. It quickly handles rendering using a
DocumentFragment, ensuring at most three content reflows. The most
important feature of `CollectionView` is the `#ModelView` property, from
which all models will have a view instantiated from. Additionally,
`CollectionView` handles memory management for you: calling `#remove()`
will `#remove()` all modelViews.

## #ModelView

The `#ModelView` property should be the View class that you wish for all
your modelViews to be rendered as.


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


## #render()

The `#render()` method augments `Minionette.View`'s `#render()` with the
collection specific rendering. It will remove all previously associated modelViews, and render the new ones inside a DocumentFragment, which will be appended to the collectionView's $el.

### "render" Event

The "render" event is still called before any regions are removed and
before any DOM changes.

### "rendered" Event

The "rendered" event is still called after all DOM changes have been
made.


## #addOne(model)

`#addOne()` instantiates a new `#ModelView` with `{model: model}`. It
then renders that modelView, and appends it's `$el` to the
collectionView's `$el`.

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

`CollectionView` augments `Minionette.View`'s `#remove()` method to make
sure all associated modelViews are `#remove()`ed.
