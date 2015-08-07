import _ from 'underscore';

// A helper function, similar to _.result
// that will call the prop on obj, unless obj
// is undefined or null. Passes the 3rd param
// as arguments to the method.
export default function attempt(obj, prop, args) {
    // Return undefined unless obj
    // is not null or undefined
    if (obj == null) { return; }
    const fn = obj[prop];

    if (_.isFunction(fn)) {
        const apply = _.isArray(args);
        return apply ? fn.apply(obj, args) : obj[prop](args);
    }
}
