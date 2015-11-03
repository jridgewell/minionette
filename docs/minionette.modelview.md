Minionette.ModelView
====================

`Minionette.ModelView` is nothing more than
[Minionette.View](/docs/minionette.view.md) with two defaults programmed
in, `#modelEvents` and `#serialize()`.

## #modelEvents

```javascript
ModelView.prototype.modelEvents = {
    change: 'render',
    destroy: 'remove'
};
```

By default, `ModelView` will listen to the `change` event on the model,
and re-render. It will also listen for the `destroy` event, and will
remove itself.

## #serialize()

`ModelView`'s `#serialize()` does nothing more than returning
`this.model.attributes`, ready to be passed into `#template()`.
