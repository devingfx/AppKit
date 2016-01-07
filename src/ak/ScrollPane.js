/**
 * ScrollPane Class
 */
Package('scroll.*');
var IScroll = scroll.IScroll = IScroll;
scroll.Bar = class Bar extends NodeClass { Bar() { super.NodeClass() } };
scroll.Thumb = class Thumb extends NodeClass { Thumb() { super.NodeClass() } };

Package('ak.*');
var ScrollPane = ak.ScrollPane = class ScrollPane extends ak.NodeClass {
	
	// _verticalScrollPolicy: true,
	// _horizontalScrollPolicy: true,
	
	ScrollPane()
	{
		console.html('<group level="instance" c="instance"><span c="icon instance">.</span>Class <span c="AppKit class">ScrollPane</span> inherits:</group>');
		super.NodeClass();
		
		
		// var _this = this;
		$( this.childNodes ).wrapAll('<pane>');
		this._$pane = this.$el.find('pane');
		
		// Scrollbars
		this.$verticalScrollbar = $('<scroll:Bar xmlns:scroll="scroll.*" vertical=""><scroll:Thumb/></scroll:Bar>');
		this.$verticalScrollbar._indicator = {
			el: this.$verticalScrollbar[0],
			listenX: false,
			listenY: true,
			fade: true,
			resize: true,
			shrink: 'clip'
		};
		this.$horizontalScrollbar = $('<scroll:Bar xmlns:scroll="scroll.*" horizontal=""><scroll:Thumb/></scroll:Bar>');
		this.$horizontalScrollbar._indicator = {
			el: this.$horizontalScrollbar[0],
			listenX: true,
			listenY: false,
			fade: true,
			resize: true,
			shrink: 'clip'
		};
		this.$verticalScrollbar[0].extends( Element ).extends().Bar();
		this.$verticalScrollbar.children()[0].extends( Element ).extends().Thumb();
		this.$horizontalScrollbar[0].extends( Element ).extends().Bar();
		this.$horizontalScrollbar.children()[0].extends( Element ).extends().Thumb();
		this.$el.append( this.$verticalScrollbar );
		this.$el.append( this.$horizontalScrollbar );
		
		this._verticalScrollPolicy = true;
		this._horizontalScrollPolicy = true;
		
		this._iScroll = new IScroll( this, {
			scrollY: true,
			scrollX: true,
			probeType: 3,
			// freeScroll: true,
			mouseWheel: true,
			// scrollbars: true,
			fadeScrollbars: true,
			// shrinkScrollbars: 'clip'
			indicators: [
				this.$horizontalScrollbar._indicator,
				this.$verticalScrollbar._indicator
			]
		} );
		
		Object.defineProperties( this, {
			horizontalScrollPolicy: {
				get: function ()
				{
					return this._horizontalScrollPolicy;
				},
	
				set: function( v )
				{
					if( /on|off/.test(v) )
					{
						this._horizontalScrollPolicy = /on/.test( v );
						this._iScroll.options.scrollX = this._horizontalScrollPolicy;
						
						var pos = this._iScroll.options.indicators.indexOf( this.$horizontalScrollbar._indicator );
						if( this._horizontalScrollPolicy && pos == -1 )
							this._iScroll.options.indicators.push( this.$horizontalScrollbar._indicator );
						else
							this._iScroll.options.indicators.splice( pos, 1 );
							
						
						// this._horizontalScrollPolicy ? 
						// 	this.$horizontalScrollbar.show() : 
						// 	this.$horizontalScrollbar.hide();
						this._iScroll.refresh();
					}
				}
			},
	
			verticalScrollPolicy: {
				get: function()
				{
					return this._verticalScrollPolicy;
				},
				
				set: function( v )
				{
					if( /on|off/.test(v) )
					{
						this._verticalScrollPolicy = /on/.test( v );
						this._iScroll.options.scrollY = this._verticalScrollPolicy;
						this._verticalScrollPolicy ? 
							this.$verticalScrollbar.show() : 
							this.$verticalScrollbar.hide();
						this._iScroll.refresh();
					}
				}
			}
		});
		
		window.addEventListener('resize', this._onResize.bind(this)); // executes layout()
		// this._onResize();
		
		console.html('<groupEnd level="instance"/>');
	}
	
	layout()
	{
		this._iScroll.refresh();
		//console.log(this.$scroller.outerHeight());
	}
	
	// get horizontalScrollPolicy()
	// {
	// 	return this._horizontalScrollPolicy;
	// }
	
	// set horizontalScrollPolicy( v )
	// {
	// 	if( /on|off/.test(v) )
	// 	{
	// 		this._horizontalScrollPolicy = /on/.test( v );
	// 		this._iScroll.options.scrollX = this._horizontalScrollPolicy;
	// 	}
	// }
	
	// get verticalScrollPolicy()
	// {
	// 	return this._verticalScrollPolicy;
	// }
	
	// set verticalScrollPolicy( v )
	// {
	// 	if( /on|off/.test(v) )
	// 	{
	// 		this._verticalScrollPolicy = /on/.test( v );
	// 		this._iScroll.options.scrollY = this._verticalScrollPolicy;
	// 	}
	// }
	
	// preinitialize()
	// {
		// this._super();
		// this.layout;
	// }
	
	initialize()
	{
		super.initialize();
		this.layout();
	}
	
}