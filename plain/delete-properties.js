/**
 * Deletes objects' properties
 * @param {Object} object Target object
 * @param {String[]} properties Property list to remove
 * @param {boolean} fast If evaluates to true, method uses faster null assignment instead of delete operation
 */
function deleteProperties(object, properties, fast) {
	object && $.each(properties, function(property) {
		if (fast) {
			object[properties[property]] = null;
		} else {
			delete object[properties[property]];
		}
	});
	return object;
};
