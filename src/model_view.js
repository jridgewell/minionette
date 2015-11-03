import View from './view';

export default View.extend({
    // Listen to the default events
    modelEvents() {
        return {
            change: 'render',
            destroy: 'remove'
        };
    },

    // The data that is sent into the template function.
    // Override this to provide custom data.
    serialize() {
        return this.model.attributes;
    }
});
