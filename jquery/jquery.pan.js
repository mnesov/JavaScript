/**
 * Applies pan functionality (WARNING! Is not optimized!)
 * TODO avoid creating own event listeners for each element
 * @author Max Nesov m.nesov@gmail.com
 */
(function($){
	$.fn.extend({ 
		pan: function(options) {
			var doAxisX, doAxisY;
			options = $.extend({
				// Constrains pan to either the horizontal (x) or vertical (y) axis. 
				// Possible values: 'x', 'y'.
				axis: false,
				wheelSpeed: 150
			}, options);
			doAxisX = !options.axis || options.axis === 'x';
			doAxisY = !options.axis || options.axis === 'y';
			return this.each(function() {
				var startPanDelta = null,
						cursor,
						viewport = $(this),
						doPanContent = function(e) {
							if (startPanDelta === null) {
								// init stage
								startPanDelta = [
									viewport.scrollLeft() + e.pageX,
									viewport.scrollTop() + e.pageY
								];
								newX = startPanDelta[0];
								newY = startPanDelta[1];
								cursor = viewport.css('cursor');
								viewport.css('cursor', 'move');
							}
							
							doAxisX && viewport.scrollLeft(startPanDelta[0] - e.pageX);
							doAxisY && viewport.scrollTop(startPanDelta[1] - e.pageY);
							viewport.trigger('pan');
						},
						stopPanContent = function() {
							viewport.unbind('mousemove', doPanContent);
							newX = newY = startPanDelta = null;
							viewport.css('cursor', cursor);
						};
				// Attach event listeners
				viewport
					.mousedown(function(e) {
						var target = $(e.target);
						if (
							!target.hasClass('js-no-pan') &&
							!target.is('textarea, input, button') &&
							!target.parentsUntil(viewport, '.js-no-pan').size()
						) {
							viewport.bind({
								mousemove: doPanContent
							});
						}
					})
					.mouseup(stopPanContent)
					.mouseleave(stopPanContent);
				
				// mousewheel support if available
				viewport.mousewheel && viewport.mousewheel(function(e, d, dx, dy) {
					doAxisX && viewport.scrollLeft(viewport.scrollLeft() + dx * options.wheelSpeed);
					doAxisY && viewport.scrollTop( viewport.scrollTop()  - dy * options.wheelSpeed);
					viewport.trigger('pan');
				});
			});
		}
	});
})(jQuery);