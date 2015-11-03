import Backbone from 'backbone'

export default Backbone.View.extend({
    // Use a span so it collapses on the DOM.
    tagName() { return 'span'; },
    // Use the data-cid attribute as a unique
    // attribute. Used for reattaching a detached view.
    attributes() {
        return { 'data-cid': this.cid };
    }
});

