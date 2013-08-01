// A helper function, similar to Rails' `try`,
// the will call the method on obj, unless obj
// is undefined or null. Passes the 3rd+ params
// as arguments to the method
function attempt(obj, method) {
    // Return undefined unless obj
    // is not null or undefined
    if (obj == null) return void 0;

    // Grab the 3rd+ params
    var args = _.rest(arguments, 2);

    if (_.isFunction(obj[method])) {
        // Call the method, as obj, with the
        // additional params
        return obj[method].apply(obj, args);
    };
}
