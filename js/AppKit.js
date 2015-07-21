/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
 
  // The base Class implementation (does nothing)
  this.Class = function(){};
 
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
   
    // Instantiate a base class (but only create the instance,
    // don't run the construct constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
   
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
           
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
           
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
           
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
   
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the construct method
      if ( !initializing && this.construct )
        this.construct.apply(this, arguments);
    }
   
    // Populate our constructed prototype object
    Class.prototype = prototype;
   
    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;
 
    // And make this class extendable
    Class.extend = arguments.callee;
   
    return Class;
  };
})();

function MakeClass(proto)
{
	var avoidAttribute = 'id class style'.split(' '),
		klass =  function NodeClass(node)
		{
			this.$el = $(this);
			localScript(this.$el);
			this._eventAttribute = function (eventName)
			{
				var _this = this;
				this.$el.on(eventName, function (event)
				{
					eval('(function(){' + (_this.$el.attr('on' + eventName) || '') + '})').call(_this, event);
				});
			};
			
			// Set attributes has properties
			$(this.$el[0].attributes).each(function ()
			{
				// console.log(this, this.ownerElement);
				if(avoidAttribute.indexOf(this.nodeName) == -1)
					for(var n in this.ownerElement)
						if(n.toLowerCase() == this.nodeName)
							this.ownerElement[n] = eval(this.nodeValue);
			});

			// Initialize
			this.construct && this.construct();
		};
	klass.prototype = proto;
	return klass;
}

function localScript(root)
{
	root = root || $('html');
	root.children('script[type="text/javascript/local"]').each(function ()
	{
		if(!this.executed)
		{
			this.executed = true;
			eval('(function(){' + this.innerHTML +'})').call(this.parentNode);
		}
	});
}


(function ( $ ) {
	$.fn.applyClass = function(klass)
	{
		return this.each(function(id, node) {
			$.extend(node, klass.prototype);
			klass.call(node);
		});
	};
}( jQuery ));





var BaseEvent = function(type, bubbles, cancelable)
{
	if(typeof type == 'undefined' || type == null || type == "")
		throw new Error("type is required!");
	this.type = type;
	this.bubbles = typeof bubbles == 'undefined' ? false : bubbles;
	this.cancelable = typeof cancelable == 'undefined' ? false : cancelable;
	this.cancelBubble = false;
	this.clipboardData = undefined;
	this.currentTarget = null;
	this.defaultPrevented = false;
	this.eventPhase = 0;
	this.returnValue = true;
	this.srcElement = null;
	this.target = null;
	this.timeStamp = new Date().getTime();
}

var EventDispatcher = Class.extend({
	construct: function (obj)
	{
		obj = obj || this;
		if(typeof obj != 'undefined' && !obj instanceof Element)
		{
			obj._listeners = {},
			obj.addEventListener = function(type, handler)
			{
				this._listeners[type] = this._listeners[type] || [];
				this._listeners[type].push(handler);
				return this;
			},
			
			// Pas testé
			obj.removeEventListener = function(type, handler)
			{
				if(this._listeners[type] && this._listeners[type].indexOf(handler) != -1)
					this._listeners[type].splice(this._listeners[type].indexOf(handler), 1);
				return this;
			},

			obj.dispatchEvent = function(evt)
			{
				if(evt instanceof BaseEvent)
				{
					evt.target = obj;
					evt.currentTarget = obj;
					// console.log(obj, Object.getOwnPropertyDescriptor(evt, 'target'));
					// console.log(Object.getOwnPropertyDescriptor(evt, 'currentTarget'));
					if(this._listeners[evt.type])
						for(var i = 0, listener; listener = this._listeners[evt.type][i]; i++)
							listener(evt);
					
				}
				return this;
			}
		}
	}
});

var NodeClass = EventDispatcher.extend({

	construct: function ()
	{
		this._super();
		
		this.$el = $(this);
		localScript(this.$el);
		this._eventAttribute = function (eventName)
		{
			var _this = this;
			this.$el.on(eventName, function (event)
			{
				eval('(function(){' + (_this.$el.attr('on' + eventName) || '') + '})').call(_this, event);
			});
		};
		
		// Set attributes has properties
		$(this.$el[0].attributes).each(function ()
		{
			// console.log(this, this.ownerElement);
			if(NodeClass.avoidAttribute.indexOf(this.nodeName) == -1)
				for(var n in this.ownerElement)
					if(n.toLowerCase() == this.nodeName)
						this.ownerElement[n] = eval('('+this.nodeValue+')');
		});
		
		if(this.id != '')
			window[this.id] = this;
	},
	initialize: function()
	{
		this._reappend();
		this.$el.children().each(function()
		{
			this.initialize && this.initialize();
		});
		this.dispatchEvent(new BaseEvent('initialized'));
	},
	
	_appendChild: Node.prototype.appendChild,
	appendChild: function(child)
	{
		this._appendChild.call(this, child);
		// var e = new BaseEvent('childAdded');
		var e = new CustomEvent('childAdded');
		e.child = child;
		this.dispatchEvent(e);
	},
	
	_reappend: function()
	{
		var childs = [].slice.call(this.childNodes);
		for(var i = 0, child; child = childs[i++];)
			this.appendChild(child);
	},
	
	/**
	 * override this method with your layout logic
	 */
	layout: function()
	{
		
	},
	
	_onResize: function()
	{
		this.layout();
	}
});
NodeClass.avoidAttribute = 'id class style src'.split(' ');


// Look the reference to the script node that loaded this script and extract the manifest attribute.
(function(){
	var ss = document.getElementsByTagName('script'),
		currentScript = ss[ss.length - 1];
	var manifest = $(currentScript).attr('manifest');
	
	if(currentScript)
	{
		currentScript.responsizes = [];
		$(currentScript).applyClass(NodeClass);
	}
	// On document ready
	$(function ()
	{
		setTimeout(function(){
		try{
			currentScript.manifest = eval('(' + manifest + ')');
		}catch(e){ console.error('Can\'t parse manifest') }
		
		// Resolve manifest classes
		if(currentScript.manifest)
		{
			for(var selector in currentScript.manifest)
				$(selector).applyClass( currentScript.manifest[selector] );
		}

		// Resolve last local scripts
		localScript();

		// Define bindings
		bindings(document.body, true);
		
		// (Very) simple responsive helper
		if( /mobile/i.test(navigator.userAgent) )
			$('html').addClass('mobile');
		else
			$('html').addClass('desktop');
		
		$('html').trigger('preinitialize');
		},1000)
	});
})();


/**
 * WebApp Class
 */
var WebApp = NodeClass.extend({
	construct: function ()
	{
		this._super();
		
		var _this = this;
		if( this.$el.id )
			window[this.$el.id] = this.$el;
		
		this.addEventListener('childAdded', function(e)
		{
			console.log('childAdded', e.child);
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
		
		// Create the map
		// this.showMap();
		
		// Setup settings menu open / close
		// $('#toolbar-button').click(function()
		// {
			// _this.toggleMenu(_this.$settings);
		// });
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
			_this.initialize();
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
	},
	
	initialize : function ()
	{
		this.$el.triggerHandler('initialize');
	},

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
			this.$el.css({transform:'none'});
			$('Menu').addClass('close');
		}
		if($menu)
		{
			console.log($menu[0].side);
			this.$el.css({transform: 'translate('+($menu[0].side=='right'?'-':'')+$menu.eq(0).width()+'px)'});
			this.$el.toggleClass($menu.attr('side') + 'MenuOpen');
			$menu[0].open();
		}
	}
});

/**
 * Page Class
 */
var Page = NodeClass.extend({
	
	_disabled: false,
	includeInLayout: true,
	_$parent: null,

	construct: function ()
	{
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
			
			var styleName = $('WebApp')[0].cssPrefix + 'transform';
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

/**
 * PageView Class
 */
var PageView = NodeClass.extend({
	
	selectedIndex: 0,
	
	construct: function ()
	{
		this._super();
		
		var _this = this;
		this.$el.css({display: 'block'});
		this.$el.find('Page').each(function (id, page) { _this.addPage(page); });

		// setHeaderIcon(this.pages[idx].id); TODO launch page displayed event
		
		//Display the first page
		this.pages.length && this.pages[this.selectedIndex] && $(this.pages[this.selectedIndex]).css('visibility', 'visible');
	},

	pages: [],
	addPage: function(page)
	{
		var _this = this;
		var pageID = this.pages.push(page) - 1;
		page._$parent = this.$el;
		// this.$el.append(page.$el/*.hide()*/);
		this.appendChild(page);
		// Header title / button
		// page.$title = $('<span class="'+page.id+'">'+page.title+'</span>').appendTo(this.$header.find('div'))
		// 					.bind('click', function()
		// 					{
		// 						// console.log("back >>>", $(this).hasClass('back'));
		// 						if($(this).hasClass('back'))
		// 							history.back();
		// 					});
		// page.$title.width(page.$title.outerWidth());
		// TabBar li
		// var $li = $('<li><icon class="'+page.icon+'"/><span>'+page.title+'</span></li>')
		// 			.bind('click', function()
		// 			{
		// 				console.log("navig", _this.pages[pageID].route);
		// 				if(pageID == 0 && Citypical.app.currentPage == 0)
		// 					Citypical.getCoordinates();
		// 				else
		// 					Citypical.router.navigate(_this.pages[pageID].route , {trigger:true});
		// 			});
		// page.$button = $li;
		if(page.includeInTabBar)
			this.$tabbar.find('ul').append($li);
	},

	currentPage: null,
	goToPage: function(pageID)
	{
		var _this = this;
		if (isNaN(pageID)) {
			pageID = this._getIdFromIdx(pageID);
		}
		if(this.pages.length > pageID)
		{
			var direction = _this.currentPage <= pageID,
				//oldPage = this.pages[pageID - 1],
				page = this.pages[pageID]/*,
				left = {transform:"translateX(-185px)"},
				center = {transform:"translateX(0px)", width: 200},
				right = {transform:"translateX(185px)"}*/;

			page.show(direction ? 1 : -1);
			
			// this.updateHeaderLayout(pageID);

			_this.currentPage = pageID;
			this.$el.trigger({
				type: 'pageDisplayed',
				page: page
			});
		}
	},
	_getIdFromIdx: function(id) {
		var i = -1;
		while (i++ < this.pages.length && isNaN(id)) {
			if (this.pages[i].id == id) {
				return i;
			}
		}
	}
});

/**
 * Menu Class
 */
var Menu = NodeClass.extend({
	construct: function ()
	{
		this._super();
		
		this.side = this.$el.attr('side') || 'left';
		this.$head = this.$el.find('header').eq(0);
		// this.$scroller = $('<div class="scroller"/>');
		
		//console.log(this.$el.children().not('header'));
		
		this.$el.children().not('header').wrapAll('<scroller/>');
		
		this.$scroller = this.$el.find('scroller');
		
		/*
		this._iScroll = new IScroll(this.$scroller[0], {
			/* click: true, * /
			preventDefaultException: { tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT|LI)$/ },
			hScroll: false,
			vScroll: true,
			vScrollbar: true
		});
		*/
		
		this.$el.on('transitionend', function(e)
		{
			$(this).hasClass('close') && (this.style.display = 'none');
		});
		this.style.display = 'none';
		window.addEventListener('resize', this._onResize.bind(this));
		this._onResize();
		
	},
	
	layout: function()
	{
		if(this.$head.length)
			this.$scroller.css({top: this.$head.outerHeight(), height: window.innerHeight - this.$head.outerHeight()});
		
		//this._iScroll.refresh();
		
		console.log(this.$scroller.outerHeight());
	},
	
	open: function()
	{
		// if(forceClose)
		// {
		// 	this.$ejjl.removeClass('menuOpen');
		// 	this.$el.addClass('close');
		// }
		// else
		// {
		// 	this.$ejjl.toggleClass('menuOpen');
		// 	this.$el.toggleClass('close');
		// }
		this.$el.toggleClass('close');
		//this._iScroll.refresh();
		this.style.display = 'block';
	},
	close: function()
	{
		
	},
	toggle: function()
	{
		
	}
});
