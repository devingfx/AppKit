/**
 * Menu Class
 */
var Menu = NodeClass.extend({
	construct: function Menu()
	{
		//console.emit(/instance/, 'group', 'Class %cMenu%c instanciated.', ''.APPKIT, '');
		//console.html('<group level="instance">Class <span c="AppKit class">Menu</span> inherits:</group>');
		console.html('<group level="instance" c="instance"><span c="icon instance">.</span>Class <span c="AppKit class">Menu</span> inherits:</group>');
		this._super();
		
		this.$head = this.$el.find('header').eq(0);
		
		this.$el.find('ul').wrap('<ScrollPane/>');
		
		this.$scroller = this.$el.find('ScrollPane');
		// this.$scroller.applyClass( ScrollPane );
		
		// this._iScroll = new IScroll(this.$scroller[0], {
		// 	/* click: true, */
		// 	preventDefaultException: { tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT|LI)$/ },
		// 	hScroll: false,
		// 	vScroll: true,
		// 	vScrollbar: true
		// });
		
		AppKit.addEventListener('initialize', this.initialize.bind(this));
		window.addEventListener('resize', this._onResize.bind(this));
		// this._onResize();
		
		//console.emit(/instance/, 'groupEnd');
		console.html('<groupEnd level="instance"/>');
	},
	
	layout: function()
	{
		if(this.$head.length)
			this.$scroller.css({top: this.$head.outerHeight(), height: window.innerHeight - this.$head.outerHeight()});
		
		this.$scroller[0]._iScroll.refresh();
		
		//console.log(this.$scroller.outerHeight());
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
	},
	close: function()
	{
		
	},
	toggle: function()
	{
		
	}
});
