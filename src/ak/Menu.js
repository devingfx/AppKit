/**
 * Menu Class
 */
Package('ak.*');
var Menu = ak.Menu = class Menu extends ak.NodeClass {
	
	constructor()
	{
		return new Element('ak:Menu').extends().Menu()
	}
	
	Menu()
	{
		//console.emit(/instance/, 'group', 'Class %cMenu%c instanciated.', ''.APPKIT, '');
		//console.html('<group level="instance">Class <span c="AppKit class">Menu</span> inherits:</group>');
		console.html('<group level="instance" c="instance"><span c="icon instance">.</span>Class <span c="AppKit class">Menu</span> inherits:</group>');
		super.NodeClass();
		
		$('body').prepend( this.$el );
		
		this.$head = this.$el.find('header').eq(0);
		
		this.$el.find('ul').wrap('<ak:ScrollPane horizontalScrollPolicy="off"/>');
		
		this.$scroller = this.$el.find('ScrollPane');
		this.$scroller[0].extends( ScrollPane ).ScrollPane();
		this.$scroller[0].style;
		this.$scroller[0].style.position = 'absolute';
		
		// this._iScroll = new IScroll(this.$scroller[0], {
		// 	/* click: true, */
		// 	preventDefaultException: { tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT|LI)$/ },
		// 	hScroll: false,
		// 	vScroll: true,
		// 	vScrollbar: true
		// });
		
		root.addEventListener('initialize', this.initialize.bind(this));
		window.addEventListener('resize', this._onResize.bind(this));
		// this._onResize();
		
		//console.emit(/instance/, 'groupEnd');
		console.html('<groupEnd level="instance"/>');
	}
	
	layout()
	{
		if(this.$head.length)
			this.$scroller.css({
				top: this.$head.outerHeight(), 
				left: 0,
				right: 0,
				bottom: 0
			});
		
		this.$scroller[0]._iScroll.refresh();
		
		//console.log(this.$scroller.outerHeight());
	}
	
	open()
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
	}
	
	close()
	{
		
	}
	
	toggle()
	{
		
	}
	
}