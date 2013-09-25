/**
 * Node tree implementation
 */
function Node(parent, children, options) {
	var i = 0;
	$.extend(this, options);
	this.children = [];
	if (parent) {
		this.setParent(parent);
	} else {
		this.parent = null;
	}
	if (children) {
		for (i in children) {
			children.addTo(this);
		}
	}
}
Node.prototype = {
	addChild: function(node) {
		node.setParent(this);
		return this;
	},
	haveChild: function(node) {
		for (var i in this.children) {
			if (this.children[i] == node) {
				return true;
			}
		}
		return false;
	},
	setParent: function(parent){
		this.detach();
		if (parent) {
			parent.children.push(this);
		}
		this.parent = parent;
		return this;
	},	
	detach: function() {
		if (this.parent) {
			var children = this.parent.children;
			for (var i in children) {
				if (children[i] === this) {
					children.splice(i, 1);
					this.parent = null;
					break;
				}
			}
		}
		return this;
	},
	destroy: function() {
		for (var i = 0, len = this.children.length; i < len; i++) {
			this.children.shift().destroy();
		}
		this.detach();
		deleteProperties(this, [
			'parent',
			'children'
		], true);
		return this;
	},

	/**
	 * Walk through the tree applying specified callback to each node
	 * @param {Function} callback, if returns false, walking process will be stopped
	 * @param {Node} node (optional) scope
	 */
	walk: function(callback, node) {
		var stop = false;
		function _walk(callback, node) {
			var i,
					child,
					children = (node||this).children;
			for (i in children) if (children.hasOwnProperty(i)) {
				child = children[i];
				stop = stop || callback(child) === false;
				if (stop) break;
				_walk(callback, child);
			}
		}
		_walk.call(this, callback, node);
	},

	/**
	 * Returns list of nodes, applying callback on which evaluates to true
	 * @param {Function} callback
	 * @returns {Array} Array of matched nodes
	 */
	grep: function(callback) {
		var nodes = [];
		this.walk(function(node) {
			if (callback(node)) {
				nodes.push(node);
			}
		});
		return nodes;
	},
	/**
	 * Get all the endpoint nodes (leaves)
	 */
	leaves: function() {
		return this.grep(function(node) {
				return !node.children || node.children.length === 0;
			});
	}
};
