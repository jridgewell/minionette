// A helper function, similar to ES6 rest param
// that will call the function with additional
// arguments collected into an array.
function rest(func) {
    var start = func.length - 1;
    if (start > 1 || start < 0) {
        throw new Error('rest() does not support functions with length ' + func.length);
    }
    return function() {
        var length = Math.max(arguments.length - start, 0);
        var rest = new Array(length);
        for (var i = 0; i < length; i++) {
            rest[i] = arguments[start + i];
        }
        switch (start) {
            case 0: return func.call(this, rest);
            case 1: return func.call(this, arguments[0], rest);
        }
    };
}
