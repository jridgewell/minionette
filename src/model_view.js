import View from 'view';

class ModelView extends View {
    // The data that is sent into the template function.
    // Override this to provide custom data.
    serialize() {
        return this.model.attributes;
    }
}

ModelView.extend = View.extend;

// Listen to the default events
ModelView.prototype.modelEvents = {
    change: 'render',
    destroy: 'remove'
};

export default ModelView;
