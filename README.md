Minionette
==========

A mini Marionette for Backbone.js

Minionette provides three highly optimized View classes for you to use,
`Minionette.View`, `Minionette.ModelView`, and
`Minionette.CollectionView`. Each class is designed to ease development,
from using several performance boosting techniques during rendering to
placing subviews directly in templates and allowing the subviews to be
easily removed.

[Minionette.View](blob/master/docs/minionette.view.md)
---------------

`Minionette.View` is the base View class, providing an easy way to
listen for events on an associated model or collection, an actually
useful generic rendering function, easy subviews (AKA Regions).


[Minionette.Region](blob/master/docs/minionette.region.md)
-----------------

`Minionette.Region`s help manage subviews of a `Minionette.View`,
allowing you to specify directly in a template where a subview should be
attached. A view can have any number of regions, each managing their own
part of the overall view.


[Minionette.ModelView](blob/master/docs/minionette.modelview.md)
--------------------

`Minionette.ModelView` is nothing more than `Minionette.View` with two
minor tweaks to easily support rendering models.


[Minionette.CollectionView](blob/master/docs/minionette.collectionview.md)
-------------------------

`Minionette.CollectionView` is an optimized `Minionette.View` for your
Backbone collections. It quickly handles rendering using a
DocumentFragment, ensuring at most two content reflows even with
hundreds of models to render. The most important feature of
`CollectionView` is the `#ModelView` property, from which all models
will have a view instantiated from. Additionally, `CollectionView`
handles memory management for you: calling `#remove()` will `#remove()`
all modelViews.
