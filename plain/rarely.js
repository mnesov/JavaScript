/**
 * Limits function calls by once in timespan
 * @param {Function} action Callee function
 * @param {Number} timespan Timespan in milliseconds
 * @param {Object} [bindTo] Object to bind function to. Defaults to window.
 */
function rarely(action, timespan, bindTo) {
	var timeout;
	return function() {
		var args = Array.prototype.slice.call(arguments);
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(function() {
			action.apply(bindTo || window, args);
		}, timespan);
	};
};
