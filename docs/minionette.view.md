Minionette.View
===============

`Minionette.View` is the base View class, providing an easy way to
listen for events on an associated model or collection, an actually
useful generic rendering function, and easy subviews (AKA Regions).

## Constructor

### Initialization Options

In addition to the default options that Backbone pulls from the
initialization options, Minionette will also pull a `#template`
function, a `Region` class, a `regions` object, and a `ui` object.

```javascript
var v = new Minionette.View({
    Region: Minionette.Region.extend(/* ... */),
    regions: {
        'one': '#one'
    },
    template: _.template('<p id="one"></p>'),
    ui: {
        'submit': '.btn[type="submit"]'
    }
});
```

### #modelEvents

`#modelEvents` is an object, in the same form as Backbone's `#events`,
that specifies an event to listen for on the associated model and the
function to call when that event is triggered. The function can either
be directly assigned, or specified with a string of the function name on
the view. This property must be specified before an object is
instantiated, because the event listening happens in the constructor.

```javascript
var V = Minionette.View.extend({
    modelEvents: {
        'change': function() {/* ... */}
    }
});
var m = new Backbone.Model();
var v = new V({model: m});
m.set('test', 'er'); //=> change listener will fire.
```

### #collectionEvents

`#collectionEvents` is an object, in the same form as Backbone's
`#events`, that specifies an event to listen for on the associated
collection and the function to call when that event is triggered. The
function can either be directly assigned, or specified with a string of
the function name on the view. This property must be specified before an
object is instantiated, because the event listening happens in the
constructor.

```javascript
var V = Minionette.View.extend({
    collectionEvents: {
        'add': function() {/* ... */}
    }
});
var c = new Backbone.Collection();
var v = new V({collection: c});
c.add({}); //=> add listener will fire.
```

### #ui

`#ui` is an object specifying individual UI elements that should have a
cached jQuery object, for easy and efficient access. It should have keys
representing the name of the UI, and values of a DOM selector to find
it. After a render, each UI element will be set as `this.${name}`.

```javascript
var V = Minionette.View.extend({
    template: _.template('<div><span class="msg">Hello!</span></div>'),
    ui: {
        message: '.msg'
    }
    
});
var v = new V();
v.$message.text('Welcome!')
console.log(v.$message); // <span class="msg">Welcome!</span>
```


## #serialize()

The `#serialize` method is meant to provide any data needed by the
`#template` method and should be overridden in a subclass. There is no
need to clone the output before returning, as it's data will be copied
over into a new object before being fed into `#template`.

```javascript
var V = Minionette.View.extend({
    template: _.template('<%= data %>'),
    serialize: function() {
        return {data: 'test'};
    }
});

var v = new V();
v.render();
console.log(v.el); //=> <div>test</div>
```


## #template(data)

The `#template` method should take any `data` needed to render the
view and its output will be used as the html for the view's $el. It is
fed all the data from the `#serialize` method, along with a special
template helper function `view`.

### view(name)

`view` is a special helper function that injects a region's subview
directly into the template. It looks for the attached region on the view,
and places the subviews entire el (including the top level tag) into
that exact spot in the template. It does _not_ render the region,
leaving that up to the developer, so that regions that don't need to be
re-rendered won't be. See an example of it's usage below:

Note: attaching an event listener on the view's 'render' event is any
easy way to re-render any regions that need it.

```javascript
var View = Minionette.View.extend({
    template: _.template('The following is rendered by a subview: <%= view("text") %>')
});
var SubView = Minionette.View.extend({
    tagName: 'span',
    template: _.template('Hello from a subview!')
});

var view = new View({el: $('body')});
var subView = new SubView();

view.addRegion('text', subView);

view.render();
subView.render();
console.log(view.el); //=> <div>The following is rendered by a subview:<span>Hello from a subview!</span></div>
```


## #remove()

The `#remove` method does exactly what you would expect it to: it
removes the view and any associated regions.

### "remove" Event

The "remove" event is fired before calling `#remove` on the view,
and is passed view as it's arguments.

### "removed" Event

The "removed" event is fired after calling `#remove` on the view,
and is passed view as it's arguments.

Note that if you used `view.listenTo(view, 'removed', ...)`, the
listener will never be fired because `view.remove()` calls
`view.stopListening()`. To properly listen for this event, use
`view.on('removed', ...)`.


## #render()

`#render` detaches all associated regions (so they don't have their
DOM events unbound), then resets the view's $el with the output of
`#template`. It will then reattach all regions into their proper
place.

### "render" Event

The "render" event is fired at the beginning of the `#render` method,
before any regions are detached and before the view's $el is reset.
Listen for this event to augment the `#render` method without
overriding it.  The view is passed as its argument.

### "rendered" Event

The "rendered" event is fired at the end of the `#render` method,
after all DOM changes. Listen for this event to augment the `#render`
method without overriding it.  The view is passed as its only argument.


## #addRegion(name, subView)

The `#addRegion` method creates a region in the view named `name` and
uses `subView` as it's view.  This region is accessible as `view[name]`.
If a false-y value is provided as `subView`, a default "place holder"
view will be used instead.

Alternatively, a selector can be passed as the `subView` argument. In
this form, the region will take over the element matched by the
selector, and attaching a view to the region will cause the matched
element to be replaced with the view.

In any case, never worry about whether this view (the parent view) has
been rendered. Region's will always be where they should be.

```javascript
var View = Minionette.View.extend({
    template: _.template('<div id="subView">This is a place holder view</div>' + 
    '<%= view("subView2") %>'),
    regions: {
        subView: '#subView',
        subView2: new Minionette.View()
    }
});

var v = new View();
v.render();
console.log(v.el); //=> <div><div id="subView">This is a place holder view</div><span data-cid="123"></span></div>

v.subView2.attach(new Minionette.View()).render();
console.log(v.el); //=> <div><div id="subView">This is a place holder view</div><div></div></div>

v.subView.attach(new Minionette.View().render());
console.log(v.el); //=> <div><div></div><div></div></div>
```


## #addRegions(regions)

The `#addRegions` method adds several regions at a time. The `regions`
parameter must be an object, with keys specifying the region name and
values having the view (or selector string). Refer to
[#addRegion](#addregionname-subview) for more information.

```javascript
var v = new Minionette.View);

v.addRegions({
    subView: '#subView',
    subView2: new Minionette.View(),
    subView3: null
});
```
