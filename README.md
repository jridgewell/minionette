Minionette [![Build Status](https://travis-ci.org/jridgewell/minionette.svg?branch=master)](https://travis-ci.org/jridgewell/minionette) [![Code Climate](https://codeclimate.com/github/jridgewell/minionette.png)](https://codeclimate.com/github/jridgewell/minionette) [![Coverage Status](https://coveralls.io/repos/jridgewell/minionette/badge.png)](https://coveralls.io/r/jridgewell/minionette)
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

Because Backbone doesn't get much better than this:

```javascript
var NavItem = Minionette.ModelView.extend({
    tagName: 'li',
    template: _.template('<a href="<%= href %>"><%= text %></a>')
});
var Nav = Minionette.CollectionView.extend({
    ModelView: NavItem,
    tagName: 'ul',
    template: _.template('<li>First</li><li class="last">last</li>'),
    appendModelView: function(view) {
        this.$('.last').before(view.$el);
    }
});

var Main = Minionette.View.extend({
    template: _.template('<p>Some content from another view</p>')
});

var navCollection = new Backbone.Collection([
    { text: 'home', href: '/' },
    { text: 'google', href: 'http://google.com/' }
]);

var App = Minionette.View.extend({
    el: $('body'),
    template: _.template(
        '<nav><%= view("nav") %></nav>' +
        '<div id="content"></div>'
    ),
    regions: {
        nav: new Nav({collection: navCollection}),
        content: '#content'
    }
});

var app = (new App()).render();
app.nav.render();

app.content.attach(new Main()).render();
```

[Minionette.View](/docs/minionette.view.md)
-----------------

`Minionette.View` is the base View class, providing an easy way to
listen for events on an associated model or collection, an actually
useful generic rendering function, easy subviews (AKA Regions).


[Minionette.Region](/docs/minionette.region.md)
-------------------

`Minionette.Region`s help manage subviews of a `Minionette.View`,
allowing you to specify directly in a template where a subview should be
attached. A view can have any number of regions, each managing their own
part of the overall view.


[Minionette.ModelView](/docs/minionette.modelview.md)
----------------------

`Minionette.ModelView` is nothing more than `Minionette.View` with two
minor tweaks to easily support rendering models.


[Minionette.CollectionView](/docs/minionette.collectionview.md)
---------------------------

`Minionette.CollectionView` is an optimized `Minionette.View` for your
Backbone collections. It quickly handles rendering using a
DocumentFragment, ensuring at most three content reflows even with
hundreds of models to render. The most important feature of
`CollectionView` is the `#ModelView` property, from which all models
will have a view instantiated from.


Other Templating Languages
--------------------------

### Handlebars.js

Full support for Handlebars.js templating is trivial. Just use the
following:

```javascript
Handlebars.registerHelper('view', function(name) {
    return new Handlebars.SafeString(this.view(name));
});
```

This will allow for template subview insertion using the special `{{view
'regionName'}}` syntax.

### Mustache.js

Full support for Mustache.js templating takes just a bit more effort.
You must override the internal-use `_serialize()` method in your view
with the following:

```javascript
var View = Minionette.extend({
    //...
    _serialize: function() {
        var _viewHelper = this._viewHelper;
        return _.extend({view: function() { return _viewHelper; }}, this.serialize());
    }
    //...
});
```

This will allow for template subview insertion using the special
`{{#view}}regionName{{/view}}` syntax.  For ease of use, have all of
your new View classes extend from this, and they will all be compatible
with Mustache.
