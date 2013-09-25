/**
 * Walks through object tree applying callback to each node
 * @param {Object} object Object to walk through
 * @param {Function} callback Callback to apply
 */
function walk(object, callback, parentObject, parentKey) {
	if (typeof callback !== 'function') return false;
	var i = 0;
	for (i in object) if (object.hasOwnProperty(i)) {
		if (typeof object[i] === 'object') {
			walk(object[i], callback, object, i);
		};
		callback(object, i, parentObject, parentKey);
	}
};
