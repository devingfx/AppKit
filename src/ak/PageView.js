/**
 * PageView Class
 */
Package('ak.*');
var PageView = ak.PageView = class PageView extends ak.NodeClass {
	
	// selectedIndex: 0,
	
	PageView()
	{
		//console.emit(/instance/, 'group', 'Class %cPageView%c instanciated.', ''.APPKIT, '');
		//console.html('<group level="instance">Class <span c="AppKit class">PageView</span> inherits:</group>');
		console.html('<group level="instance" c="instance"><span c="icon instance">.</span>Class <span c="AppKit class">PageView</span> inherits:</group>');
		super.NodeClass();
		
		var _this = this;
		this.pages = [];
		this.currentPageID = -1;
		
		this.style.display = 'block';
		this.$('Page').map( page => this.addPage(page) );

		// setHeaderIcon(this.pages[idx].id); TODO launch page displayed event
		
		//Display the first page
		this.pages.length && 
			(this.currentPage = this.pages[this.selectedIndex]) && 
				(this.currentPage.style.visibility = 'visible');
		
		//console.emit(/instance/, 'groupEnd');
		console.html('<groupEnd level="instance"/>');
	}

	addPage(page)
	{
		var _this = this;
		var pageID = this.pages.push(page) - 1;
		page._$parent = this;
		// this.$el.append(page.$el/*.hide()*/);
		this.appendChild( page );
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
		//if(page.includeInTabBar)
		//	this.$tabbar.find('ul').append($li);
	}

	goToPage( pageID )
	{
		var _this = this;
		if( isNaN(pageID) )
		{
			pageID = this._getIdFromIdx( pageID );
		}
		if( this.pages.length > pageID )
		{
			var direction = _this.currentPageID <= pageID,
				//oldPage = this.pages[pageID - 1],
				page = this.pages[pageID]/*,
				left = {transform:"translateX(-185px)"},
				center = {transform:"translateX(0px)", width: 200},
				right = {transform:"translateX(185px)"}*/;

			page.show(direction ? 1 : -1);
			
			// this.updateHeaderLayout(pageID);

			_this.currentPageID = pageID;
			_this.currentPage = page;
			this.dispatchEvent( 
								(e = new Event('pageDisplayed'),
								e.page = page,
								e)
							);
		}
	}
	
	_getIdFromIdx( id )
	{
		var i = -1;
		while( i++ < this.pages.length && isNaN(id) )
			if ( this.pages[i].id == id )
				return i;
			
	}
}
