(function($) {
	$.widget('custom.lionScrolls', {
		options: {
			horizontal: ['scroll', 'hidden'][0],
			vertical: ['scroll', 'hidden'][0],
			delay: 0, // milliseconds, 0 for show always
			margin: 2,
			domClass: 'lion-scrolls'
		},
		
		_create: function() {
//			getComputedStyle(this.element[0]).getPropertyCSSValue('overflow-x').cssText;
			$.extend(this, {
				bars: {},
				drags: {},
				ratios: {},
				barPositions: {},
				dragPositions: {}
			});
			
			this.element
				.pan() // TODO: emulate needed func from .pan() (mousewheel->scroll) to avoid its dependance
				.addClass(this.options.domClass)
				.css({
					overflow: 'hidden'
				});
			
			$.each(['horizontal', 'vertical'], $.proxy(function(i, dir) {
				var bar = null, drag = null,
						maxDragPosition = 0, maxScroll = 0;
						
				i = !i; // used to select appropriate option for current scroller direction (true, then false)
				if (this.options[dir] === 'scroll') {
					bar = this.bars[dir] = $('<div class="'+this.options.domClass+'-bar ' + dir + '"><div class="'+this.options.domClass+'-drag"></div></div>')
						.click($.proxy(function(e) {
							var dragSize = drag[i? 'width' : 'height'](),
									clickOffset;
							
							if (e.target === e.currentTarget) {
								clickOffset = e[i? 'pageX' : 'pageY'] - this.bars[dir].offset()[i? 'left' : 'top']; // firefox have no simpler e.offsetX/e.offsetY
								this.element[i? 'scrollLeft' : 'scrollTop'](
									this.element[i? 'scrollLeft' : 'scrollTop']() + // current scroll position
									dragSize / this.ratios[dir] * (clickOffset < parseInt(drag.css(i? 'left' : 'top')) ? -1 : 1) // scroll delta
								);
							}
						}, this))
						.appendTo(this.element.parent());
					drag = this.drags[dir] = bar.find('.'+this.options.domClass+'-drag')
						.draggable({
							axis: i? 'x' : 'y',
							containment: bar,
							start: $.proxy(function() {
								this._draggingNow = true;
								maxDragPosition = bar[i? 'width' : 'height']() - drag[i? 'width' : 'height']();
								maxScroll = this.element[0][i? 'scrollWidth' : 'scrollHeight'] - this.element[i? 'outerWidth' : 'outerHeight']();
							}, this),
							stop: $.proxy(function() {
								this._draggingNow = false;
							}, this),
							drag: $.proxy(function(e, ui) {
								this.element[i? 'scrollLeft' : 'scrollTop'](ui.position[i? 'left' : 'top'] / maxDragPosition * maxScroll);
							}, this)
						});
				}
			}, this));
			
			this.window.on('resize', rarely(this.refresh, 100, this)); // $.proxy(this.refresh, this)
			this.element.on('scroll', $.proxy(this.refresh, this));
			this.refresh();
		},
		_destroy: function() {
			this.element.removeClass(this.options.domClass);
		},
		refresh: function() {
			if (this._draggingNow || !this.element.hasClass(this.options.domClass)) return;
			var domElement = this.element[0];
			$.each(['horizontal', 'vertical'], $.proxy(function(i, dir) {
				i = !i;
				var bar = this.bars[dir],
						drag = this.drags[dir],
						ratio, 
						oppositeSide = i? 'vertical' : 'horizontal',
						domSize = this.element[i? 'outerWidth' : 'outerHeight'](),
						domScroll = domElement[i? 'scrollWidth' : 'scrollHeight'],
						barSize,
						dragPosition,
						elementOffset = this.element.offset(),
						parentOffset = this.element.parent().offset() || { left:0, top:0 },
						barPosition = {
							left: elementOffset.left - parentOffset.left,
							top:  elementOffset.top  - parentOffset.top
						},
						changed = false;

				if (bar) {
					// get view / content size ratio
					ratio = domSize / domScroll;
					if (this.ratios[dir] !== ratio) {
						changed = true;
						this.ratios[dir] = ratio;
					}
					if (!isFinite(ratio) || ratio === 1) {
						// dont need to show and update the bar if it is unusable
						return bar.fadeOut();
					} else {
						bar.show();
					}
					
					// update bar position
					barPosition.left += i? this.options.margin : this.element.outerWidth() - bar.width() - this.options.margin;
					barPosition.top  += i? this.element.outerHeight() - bar.height() - this.options.margin : this.options.margin;
					bar.css(barPosition);
					
					// set bar size
					barSize = domSize - this.options.margin * 2;
					if (isFinite(this.ratios[oppositeSide]) && this.ratios[oppositeSide] !== 1) {
						barSize -= this.bars[oppositeSide][i? 'width' : 'height']() + this.options.margin;
					}
					bar[i? 'width' : 'height'](barSize);
					
					// set drag size and position
					dragPosition = Math.round(domElement[i? 'scrollLeft' : 'scrollTop'] / domScroll * barSize);
					if (this.dragPositions[dir] !== dragPosition) {
						changed = true;
						this.dragPositions[dir] = dragPosition;
					}
					drag[i? 'width' : 'height'](Math.round(barSize * ratio))
						.css(i? 'left' : 'top', dragPosition + 'px');
					
					if (changed) bar.show();
					
					// manage autoHide in case of delay is not 0
					if (this.options.delay) {
						clearTimeout(this._hideTimeout);
						this._hideTimeout = setTimeout($.proxy(function() {
							$.map(this.bars, function(bar) { bar.fadeOut(); });
						}, this), this.options.delay);
					};
				}
			}, this));
		}
	});
})(jQuery);
