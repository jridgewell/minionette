$.event.special.remove = {
    remove: function(e) {
        if (e.handler) e.handler();
    }
};
