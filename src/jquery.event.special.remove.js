// Force jQuery to emit remove events.
// Our views bind to it to see if they
// have been removed and should be cleaned.
if ($) {
    var _cleanData = $.cleanData;
    $.cleanData = function( elems ) {
        for ( var i = 0, elem; (elem = elems[i]) !== undefined; i++ ) {
            try {
                $( elem ).triggerHandler( 'remove' );
            } catch( e ) {}
        }
        _cleanData( elems );
    };
}
