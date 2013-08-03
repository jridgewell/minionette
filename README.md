Minionette
==========

A mini Marionette for Backbone.js

Minionette provides three highly optimized View classes for you to use,
`Minionette.View`, `Minionette.ModelView`, and
`Minionette.CollectionView`.

[Minionette.View](blob/master/docs/minionette.view.md)
---------------



[Minionette.Region](blob/master/docs/minionette.region.md)
-----------------



[Minionette.ModelView](blob/master/docs/minionette.modelview.md)
--------------------

`Minionette.ModelView` is nothing more than `Minionette.View` with two
minor tweaks to easily support rendering models.


[Minionette.CollectionView](blob/master/docs/minionette.collectionview.md)
-------------------------

`Minionette.CollectionView` is an optimized `Minionette.View` for your
Backbone collections. It quickly handles rendering using a
DocumentFragment, ensuring at most two content reflows. The most
important feature of `CollectionView` is the `#ModelView` property, from
which all models will have a view instantiated from. Additionally,
`CollectionView` handles memory management for you: calling `#remove()`
will `#remove()` all modelViews.
