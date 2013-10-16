Minionette
==========

A mini Marionette for Backbone.js

Minionette provides three highly optimized View classes for you to use,
`Minionette.View`, `Minionette.ModelView`, and
`Minionette.CollectionView`. Each class is designed to ease development,
from using several performance boosting techniques during rendering to
placing subviews directly in templates and allowing the subviews to be
easily removed.

Why?
----

Because Backbone doesn't get much better than this: [JS Bin](http://jsbin.com/oKEruPE/1/edit?js,output)

```javascript
var NavItem = Minionette.ModelView.extend({
    tagName: 'li',
    template: _.template('<a href="<%= href %>"><%= text %></a>')
});
var Nav = Minionette.CollectionView.extend({
    ModelView: NavItem,
    tagName: 'ul',
    template: _.template('<li>before</li><li class="last">last</li>'),
    appendHtml: function(element) {
        this.$('.last').before(element);
    }
});

var Main = Minionette.View.extend({
    template: _.template('<p>Some content</p>')
});

var navColleciton = new Backbone.Collection([
    { text: 'home', href: '/' },
    { text: 'google', href: 'http://google.com/' }
]);

var App = Minionette.View.extend({
    el: $('body'),
    template: _.template(
        '<nav><%= view("nav") %></nav>' +
        '<%= view("contents") %>'
    ),
    regions: {
        nav: false,
        contents: new Main()
    }
});

var app = (new App()).render();
app.contents.render();

var anotherNav = new Nav({collection: navColleciton});
app.nav.attach(anotherNav.render());
```

[Minionette.View](/docs/minionette.view.md)
---------------

`Minionette.View` is the base View class, providing an easy way to
listen for events on an associated model or collection, an actually
useful generic rendering function, easy subviews (AKA Regions).


[Minionette.Region](/docs/minionette.region.md)
-----------------

`Minionette.Region`s help manage subviews of a `Minionette.View`,
allowing you to specify directly in a template where a subview should be
attached. A view can have any number of regions, each managing their own
part of the overall view.


[Minionette.ModelView](/docs/minionette.modelview.md)
--------------------

`Minionette.ModelView` is nothing more than `Minionette.View` with two
minor tweaks to easily support rendering models.


[Minionette.CollectionView](/docs/minionette.collectionview.md)
-------------------------

`Minionette.CollectionView` is an optimized `Minionette.View` for your
Backbone collections. It quickly handles rendering using a
DocumentFragment, ensuring at most three content reflows even with
hundreds of models to render. The most important feature of
`CollectionView` is the `#ModelView` property, from which all models
will have a view instantiated from.
