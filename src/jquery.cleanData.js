// Force jQuery to emit remove events.
// Our views bind to it to see if they
// have been removed and should be cleaned.
(function($) {
    if (!$) { return; }
    var _cleanData = $.cleanData;
    $.cleanData = function(elems) {
        _.each(elems, function(elem) {
            try {
                $(elem).triggerHandler('remove');
            } catch(e) {}
        });
        _cleanData(elems);
    };
})(jQuery);
