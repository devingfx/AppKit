/**
 * WebApp Class
 */
var WebApp = NodeClass.extend({
	construct: function WebApp()
	{
		//console.emit(/instance/, 'group', 'Class %cWebApp%c instanciated.', ''.APPKIT, '');
		//console.html('<group level="instance" c="instance"><span c="icon instance">.</span>Class <span c="AppKit class">WebApp</span> inherits:</group>');
		console.html('<group c="instance"><span level="instance" c="icon instance">.</span>Class <span c="AppKit class">WebApp</span> inherits:</group>');
		this._super();
		
		var _this = this;
		
		this.addEventListener('childAdded', function(e)
		{
			console.html('<info level="event"><event type="childAdded" icon="listen">target</event><br/><o>event</o><br/><o>event.child</o></info>', {target: _this, event: e});
		});
		
		// Select important nodes
		this.$header = this.$el.find('header').eq(0);
		// this.$navMenu = this.$header.find('#menuSlide');
		// this.$settings = $('#settingsMenu');
		this.$pageView = $('PageView');
		//this.$tabbar = $('<div/>');
		
		// Fix body sizes
		$('body').css({height: 5000});
		window.scrollTo(0,0);
		this.layout();
		
		// Click anywhere in app to close settings menu
		this.$el[0].addEventListener('click', function(e)
		{
			if(e.target != _this.$header.find('#showLeft')[0] &&  
				e.target != _this.$header.find('.H_C_menu')[0] &&  
				e.target != $('#toolbar-button')[0]
				)
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
		
		$('html').on('preinitialize', function ()
		{
			_this.preinitialize();
		});

		window.addEventListener('resize', this._onResize.bind(this));
		this._onResize();

		/* window.addEventListener('click', function(e) {
			// if (e.target.type != 'text' && e.target.type != 'password') {
				document.body.webkitRequestFullScreen();
				window.setTimeout(function() {
					// document.webkitCancelFullScreen();
				}, 500);
			// }
		}, false); */
		
		this.$el.triggerHandler('preinitialize');
		//AppKit.addEventListener('initialized', this.initialize.bind(this) );
		
		//console.emit(/instance/, 'groupEnd');
		console.html('<groupEnd level="instance"/>');
	},
	
	/*initialize : function ()
	{
		this._super();
		//this.$el.triggerHandler('initialize');
	},
	*/
	/**
	 * override this method to be called on window resize
	 */
	layout: function()
	{
		var _this = this;
		// Fix body sizes
		// alert(window.innerHeight);
		$('body')./*add(this.$el).*/css({width: window.innerWidth, height: window.innerHeight});
		// this.$el.css({width: window.innerWidth, height: window.innerHeight});

		// Fix PageView right under the header and good height
		this.$pageView.css({top: this.$header.outerHeight(), height: window.innerHeight - this.$header.height()});
	},

	/**
	 * Cross-browser xhr call with callback (old)
	 */
	ajax : function(sUrl, fSuccess, fError, sMethod, oData)
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
	},
	
	toggleMenu: function ($menu)
	{
		if(!$menu || this.$el.hasClass('leftMenuOpen') || this.$el.hasClass('rightMenuOpen'))
		{
			this.$el.removeClass('leftMenuOpen rightMenuOpen');
			$('Menu').addClass('close');
		}
		if($menu)
		{
			this.$el.toggleClass($menu.attr('side') + 'MenuOpen');
			$menu.toggleClass('close');
			$menu[0]._iScroll.refresh();
		}
	}
});
