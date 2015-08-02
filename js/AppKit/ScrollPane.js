/**
 * ScrollPane Class
 */
var ScrollPane = NodeClass.extend({
	
	verticalScrollPolicy: 'on',
	horizontalScrollPolicy: 'on',
	
	construct: function ScrollPane()
	{
		console.html('<group level="instance" c="instance"><span c="icon instance">.</span>Class <span c="AppKit class">ScrollPane</span> inherits:</group>');
		this._super();
		
		// var _this = this;
		this.$el.children().wrapAll('<pane>');
		this._$pane = this.$el.find('pane');
		
		this.$verticalScrollbar = $('<scrollbar vertical><indicator></scrollbar>')
		this.$horizontalScrollbar = $('<scrollbar horizontal><indicator></scrollbar>')
		this.$el.append( this.$verticalScrollbar );
		this.$el.append( this.$horizontalScrollbar );
		
		this._iScroll = new IScroll( this, {
			scrollY: true,
			scrollX: true,
			freeScroll: true,
			mouseWheel: true,
			// scrollbars: true,
			fadeScrollbars: true,
			// shrinkScrollbars: 'clip'
			indicators: [
				{
					el: this.$verticalScrollbar[0],
					fade: true,
					resize: true,
        			shrink: 'clip'
				},
				{
					el: this.$horizontalScrollbar[0],
					fade: true,
					resize: true,
        			shrink: 'clip'
				}
			]
		} );
		
		window.addEventListener('resize', this._onResize.bind(this)); // executes layout()
		// this._onResize();
		
		
		console.html('<groupEnd level="instance"/>');
	},
	
	layout: function()
	{
		this._iScroll.refresh();
		//console.log(this.$scroller.outerHeight());
	},
	
	preinitialize: function()
	{
		this._super();
		this.layout;
	},
	
	initialize: function()
	{
		this._super();
		this.layout();
	}
	
});