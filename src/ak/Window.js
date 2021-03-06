/**
 * Window Class
 */
Package('ak.*');
var Window = ak.Window = class Window extends ak.NodeClass {
	
	Window()
	{
		//console.emit(/instance/, 'group', 'Class %cWebApp%c instanciated.', ''.APPKIT, '');
		//console.html('<group level="instance" c="instance"><span c="icon instance">.</span>Class <span c="AppKit class">WebApp</span> inherits:</group>');
		console.html('<group c="instance"><span level="instance" c="icon instance">.</span>Class <span c="AppKit class">WebApp</span> inherits:</group>');
		super.NodeClass();
		
		var _this = this;
		
		this.addEventListener('childAdded', function(e)
		{
			console.html('<info level="event"><event type="childAdded" icon="listen">target</event><br/><o>event</o><br/><o>event.child</o></info>', {target: _this, event: e});
		});
		
		// Select important nodes
		this.$header = this.$('WebAppHeader')[0];

		

		// this.$navMenu = this.$header.find('#menuSlide');
		// this.$settings = $('#settingsMenu');
		this.$pageView = document.$('PageView')[0];
		//this.$tabbar = $('<div/>');
		
		
		// Click anywhere in app to close settings menu
		this.addEventListener('click', function( e )
		{
			if( e.target == this )
			 //&& !$(e.target).parents('Menu').length )
			{
				_this.toggleMenu(null, true);
			}
		}, true);
		
		//Set header icon
		// this.$pageView.on('pageDisplayed', function(e){
			// setHeaderIcon(e.page.id);
		// });
		// Setup events listening from attributes
		this._eventAttribute('preinitialize');
		this._eventAttribute('initialize');
		
		document.documentElement.addEventListener('preinitialize', this.preinitialize.bind(this) );
		document.documentElement.addEventListener('initialize', this.initialize.bind(this) );
		
		window.addEventListener('resize', this._onResize.bind(this));
		// this._onResize();

		/* window.addEventListener('click', function(e) {
			// if (e.target.type != 'text' && e.target.type != 'password') {
				document.body.webkitRequestFullScreen();
				window.setTimeout(function() {
					// document.webkitCancelFullScreen();
				}, 500);
			// }
		}, false); */
		
		this.dispatchEvent( new Event('preinitialize') );
		//AppKit.addEventListener('initialized', this.initialize.bind(this) );
		
		//console.emit(/instance/, 'groupEnd');
		console.html('<groupEnd level="instance"/>');
	}
	
	createChildren()
	{
		this.rawChildren.insertBefore( new Node('header'), this.rawChildren.children[0] );
	}

	initialize()
	{
		if( this._initialized ) return this;
		
		super.initialize();
		this.createChildren();
		
		// Fix body sizes
		// $('body').css({height: 5000});
		window.scrollTo(0,0);
		this.layout();
		
		//this.$el.triggerHandler('initialize');
	}
	
	/**
	 * override this method to be called on window resize
	 */
	layout()
	{
		var _this = this;
		// Fix body sizes
		// alert(window.innerHeight);
		// $('body')./*add(this.$el).*/css({width: window.innerWidth, height: window.innerHeight});
		// this.$el.css({width: window.innerWidth, height: window.innerHeight});

		// Fix PageView right under the header and good height
		if( this.$header.hasAttribute('overlay') )
			this.$pageView.style.top = 0;
		else
			this.$pageView.style.top = this.$header.offsetHeight;
		// this.$pageView.css({top: this.$header.outerHeight(), height: window.innerHeight - this.$header.outerHeight()});
	}

	/**
	 * Cross-browser xhr call with callback (old)
	 */
	ajax(sUrl, fSuccess, fError, sMethod, oData)
	{
		var xhr_object = window.XMLHttpRequest ? new XMLHttpRequest() : (window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : null);
		if(xhr_object != null)
		{
			xhr_object.open(sMethod || "GET", sUrl, true);
			xhr_object.onreadystatechange = function()
			{
				if ( xhr_object.readyState == 4 )
					(fSuccess || function(){})(xhr_object.responseText);
				else
					(fError || function(){})();
			}
			xhr_object.send(oData || null);
		}
		else
			(fError || function(){})();
	}
	
	toggleMenu($menu)
	{
		if( !$menu || this.classList.contains('leftMenuOpen') || this.classList.contains('rightMenuOpen') )
		{
			this.classList.remove('leftMenuOpen','rightMenuOpen');
			document.$('Menu').forEach( menu => menu.classList.add('close') );
		}
		if( $menu )
		{
			this.classList.toggle( $menu.getAttribute('side') + 'MenuOpen' );
			$menu.classList.toggle('close');
			// $menu[0]._iScroll.refresh();
		}
	}
}


/**
 * WebAppHeader Class
 */
var WebAppHeader = ak.WebAppHeader = class WebAppHeader extends NodeClass {
	
	// collapseOnScroll: null,
	// _lastScroll: 0,
	 
	WebAppHeader()
	{
		console.html('<group c="instance"><span level="instance" c="icon instance">.</span>Class <span c="AppKit class">WebAppHeader</span> inherits:</group>');
		//html
		super.NodeClass();
		
		var _this = this;
		
		document.addEventListener('initialize', this.initialize.bind(this));
		// window.addEventListener('resize', this._onResize.bind(this));
		this._onResize();

		// this.$el.triggerHandler('preinitialize');
		
		console.html('<groupEnd level="instance"/>');
	}
	
	initialize()
	{
		super.initialize();
		if( this.collapseOnScroll && this.collapseOnScroll && this.collapseOnScroll._iScroll )
		{
			var _this = this,
				_iScroll = this.collapseOnScroll._iScroll;
				
			_iScroll.on( 'scrollStart', this.onCollapsingScrollStart.bind(this) );
			_iScroll.on( 'scroll', this.onCollapsingScrollMove.bind(this) );
			_iScroll.on( 'scrollEnd', this.onCollapsingScrollEnd.bind(this) );
		}
	}
	
	onCollapsingScrollStart()
	{
		this._scrollStart = this.collapseOnScroll._iScroll.y;
	}
	
	onCollapsingScrollMove()
	{
		var _this = this,
	    	h = _this.offsetHeight,
			_iScroll = this.collapseOnScroll._iScroll,
			delta = _this._scrollStart - _iScroll.y;
		
		// if( -_iScroll.y > h )
		// {
			// _this._scrollStart - _iScroll.y;
			if( Math.abs(delta) > h/2 )
			{
				this.classList.add( delta >= 0 ? 'collapsed' : 'uncollapsed' );
				this.classList.remove( delta >= 0 ? 'uncollapsed' : 'collapsed' );
				 
				this._scrollStart = delta >= 0 ? this._scrollStart + h/2 : this._scrollStart - h/2;
				//this.collapseOnScroll._iScroll.y;
			}
		// }
		// _this._percent = h / delta;
	    // delta = delta < 0 ? 0 : delta > h ? h : delta;
	    // console.log( "delta: %s \nh: %s", delta, h );
	    // console.log( "last: %s \ny: %s \n%: %s", _this._lastScroll, _iScroll.y, _percent );
	    // _this.$el.css({
	         //transform: 'translateY(' + -(delta) + '%)'
	         //transform: 'scaleY(' + (50+_iScroll.y)/50 + ')'
	         //transform: 'rotateX(' + _iScroll.y + 'deg) rotateY(' + _iScroll.y/2 + 'deg)'
	         //transform: 'rotateX(' + -_iScroll.y + 'deg)'
	         //transform: 'translateY('+-_iScroll.y+'px) rotate(' + _iScroll.y + 'deg)'
	     //})
	}
	
	onCollapsingScrollEnd()
	{
		this._lastScroll = this.collapseOnScroll._iScroll.y;
		console.log( "end: ", this._lastScroll, this.collapseOnScroll._iScroll.y );
		
	}
	
	
	/**
	 * override this method to be called on window resize
	 */
	// layout()
	// {
	// 	var _this = this;
	// }
}
