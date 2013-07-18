// Force jQuery to emit remove events
// Our views bind to it to see if they
// have been removed and should be closed
$.event.special.remove = {
    remove: function(e) {
        if (e.handler) { e.handler(); }
    }
};
