/**
 * Page Class
 */
Package('ak.*');
var Page = ak.Page = class Page extends ak.ScrollPane {
	
	// _disabled: false,
	// includeInLayout: true,
	// _$parent: null,

	Page()
	{
		//console.emit(/instance/, 'group', 'Class %cPage%c instanciated.', ''.APPKIT, '');
		//console.html('<group level="instance">Class <span c="AppKit class">Page</span> inherits:</group>');
		console.html('<group level="instance" c="instance"><span c="icon instance">.</span>Class <span c="AppKit class">Page</span> inherits:</group>');
		super.ScrollPane();
		
		this.style.display = 'block';
// 		this.__defineGetter__("disabled", function () {
// 			return this._disabled;
// 		});
// 		this.__defineSetter__("disabled", function (val) {
// 			// log("setter de coords: " + (val) );
// 			this._disabled = val;
// 			if(typeof this.$button != "undefined")
// 			{
// 				if(!val)
// 					this.$button.removeClass('disabled');
// 				else
// 					this.$button.addClass('disabled');
				
// 			}
// 		});

		//console.emit(/instance/, 'groupEnd');
		console.html('<groupEnd level="instance"/>');
	}
	
	get disabled()
	{
		return this._disabled;
	}
	set disabled( val )
	{
			// log("setter de coords: " + (val) );
		this._disabled = val;
		if(typeof this.$button != "undefined")
		{
			if(!val)
				this.$button.removeClass('disabled');
			else
				this.$button.addClass('disabled');

		}
	}


	show( direction )
	{
		direction = typeof direction == 'undefined' ? 1 : direction;
		
		if (this._$parent.$('Page').length)
		{
			// Get the current shown page(s)
			var $old = this._$parent.currentPage;
			
			// var styleName = /*$('WebApp')[0].cssPrefix +*/ 'transform';
			this.style.transfom = 'translateX(' + (100 * direction) + '%)';
			this.style.display = 'block';
			this.style.visibility = 'visible';
			// this.$el.hide().css(styleName, 'translateX(' + (100 * direction) + '%)').show().css('visibility', 'visible');
			this.scrollTop = Number(this.getAttribute('scroll'));
			// this.$el.scrollTop(this.$el.attr('scroll'));
			$old && $old.setAttribute('scroll', $old.scrollTop);
			// $old.attr('scroll', $old.scrollTop());
			setTimeout(() =>{
				this.style.transform = 'translateX(0)';
				// _this.$el.css(styleName, 'translateX(0)');
				$old && ($old.style.transform = 'translateX(' + (-100 * direction) + '%)');
				// $old.css(styleName, 'translateX(' + (-100 * direction) + '%)');
			}, 10);
			
			// Can't use .one() here because it remove the handler only if each event are fired
			// $old.on('transitionend webkitTransitionEnd oTransitionEnd otransitionend', function() {
			$old && $old.addEventListener('transitionend', function onEnd() {
				// $old.off('transitionend webkitTransitionEnd oTransitionEnd otransitionend').hide();
				$old.removeEventListener( 'transitionend', onEnd );
				// $old.off('transitionend webkitTransitionEnd oTransitionEnd otransitionend')
				// 	.css('visibility', 'hidden');
				$old.style.visibility = 'hidden';
			});

		}

		/* TODO: This is not cross platform. Jquery has .scrollTop(), but zepto does not. Port? */
		// window.scrollTo(0, 0);
	}
	
}
