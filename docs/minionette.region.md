Minionette.Region
=================

`Minionette.Region`s help manage subviews of a `Minionette.View`,
allowing you to specify directly in a template where a subview should be
attached. A view can have any number of regions, each managing their own
part of the overall view.

## #View

`#View` is the class of the "placeholder" view. When a Backbone.View is
not attached to the region, the placeholder will take its place (so
that a new view can be attached in the correct place in the parent
view). The placeholder will only ever be instantiated once, and will be
internally kept. When the attached subview is detached/removed, the
placeholder will take it's place. By default, the view is a empty span
element, with a "data-cid" attribute set to the placeholder's cid.


## #reset(detach = false)

The `#reset()` method resets the region to using the placeholder view.
It optionally takes a `detach` parameter that, when true, will not call
`view.remove()` on the region's current view.


## #render()

The `#render()` method is a helper that delegates to the region's view.


## #attach(newView, detach = false)

The `#attach()` method attaches `newView` (top level element and all) to
the region in the exact same spot as the region's current view. It optionally takes a `detach` parameter that, when true, will not call
`view.remove()` on the region's current view.


## #detach()

The `#detach()` method detaches the region's current view (storing a
reference to it internally) and replaces it with the placeholder. That
current view is stored internally so that you can call `#reattach()`.
This is exceptionally useful during rendering, since detaching the
region will preserve the current view's DOM event listeners.


## #reattach()

The `#reattach()` method takes the internally stored detached view (see
`#detach()`) and reinserts it into the parent view.


## #remove()

The `#remove()` method removes the region (and the subview and
current view) from the parent view.
