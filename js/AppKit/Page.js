/**
 * Page Class
 */
var Page = NodeClass.extend({
	
	_disabled: false,
	includeInLayout: true,
	_$parent: null,

	construct: function Page()
	{
		//console.emit(/instance/, 'group', 'Class %cPage%c instanciated.', ''.APPKIT, '');
		//console.html('<group level="instance">Class <span c="AppKit class">Page</span> inherits:</group>');
		console.html('<group level="instance" c="instance"><span c="icon instance">.</span>Class <span c="AppKit class">Page</span> inherits:</group>');
		this._super();
		
		this.$el.css({display: 'block'});
		this.__defineGetter__("disabled", function () {
			return this._disabled;
		});
		this.__defineSetter__("disabled", function (val) {
			// log("setter de coords: " + (val) );
			this._disabled = val;
			if(typeof this.$button != "undefined")
			{
				if(!val)
					this.$button.removeClass('disabled');
				else
					this.$button.addClass('disabled');
				
			}
		});

		//console.emit(/instance/, 'groupEnd');
		console.html('<groupEnd level="instance"/>');
	},

	show: function (direction)
	{
		direction = typeof direction == 'undefined' ? 1 : direction;
		
		if (this._$parent.find('Page').length)
		{
			// Get the current shown page(s)
			var $old = this._$parent.find('Page:visible').not(this.$el);
			//.filter(":visible")			
			var _this = this;
			
			var styleName = /*$('WebApp')[0].cssPrefix +*/ 'transform';
			this.$el.hide().css(styleName, 'translateX(' + (100 * direction) + '%)').show().css('visibility', 'visible');
			this.$el.scrollTop(this.$el.attr('scroll'));
			$old.attr('scroll', $old.scrollTop());
			setTimeout(function() {
				_this.$el.css(styleName, 'translateX(0)');
				$old.css(styleName, 'translateX(' + (-100 * direction) + '%)');
			}, 10);
			
			// Can't use .one() here because it remove the handler only if each event are fired
			$old.on('transitionend webkitTransitionEnd oTransitionEnd otransitionend', function() {
				// $old.off('transitionend webkitTransitionEnd oTransitionEnd otransitionend').hide();
				$old.off('transitionend webkitTransitionEnd oTransitionEnd otransitionend').css('visibility', 'hidden');
			});

		}

		/* TODO: This is not cross platform. Jquery has .scrollTop(), but zepto does not. Port? */
		// window.scrollTo(0, 0);
	}
});
