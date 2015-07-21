/**
 * WebApp Class
 */
var WebApp = function (node)
{
	this.$el = $(this);
	this.initialize();
}

WebApp.prototype = {
	initialize: function ()
	{
		var _this = this;
		// Select important nodes
		// this.$el = $('#app');
		this.$settings = $('#settingsMenu');
		this.$header = $('header');
		this.$pageView = $('PageView');
		this.$tabbar = $('<div/>');
		
		// Create the map
		this.showMap();
		
		// Setup settings menu open / close
		this.$header.find('img[alt=Options]').bind('click', function()
		{
			_this.$el.toggleClass('menuOpen');
			_this.$settings.toggleClass('close');
		});
		// Click anywhere in app to close settings menu
		this.$el.bind('click', function(e)
		{
			if(e.target != _this.$header.find('img[alt=Options]')[0])
			{
				_this.$el.removeClass('menuOpen');
				_this.$settings.addClass('close');
			}
		});

		window.addEventListener('resize', this._onResize.bind(this));
		this._onResize();
	},

	showMap: function ()
	{
		var _this = this;
		ppm.modules.Core(function()
		{
			// window.map = new ppm.Map(document.querySelector('ppm\\.Core\\:Map'), {
			var map = _this.map = new ppm.Map(document.querySelector('ppm\\:Map'), {
				center: [43.609, 7.018],
				zoom: 16,
				showControls: false,
				mapStyleControl: false,
				enablePOIs: true,
				showPOIBar: true,
				POIBarOptions: {
					position: 'Cats118',
					layoutMethod: 'left',
					buttonsDropInPanel: false
				}
			})
				// .setView([43.609,7.018], 16,{reset: true})
				// .addLayer(bing);
			
			// document.getElementById('Cats118').addEventListener()
			if(map.options.showPOIBar)
				map.on('POITypesLoaded', function ()
				{
					window.tg = new iScroll(document.getElementById('Cats118'), {hScroll: true, vScroll: false});

				});

			_this.markers = new ppm.FeatureGroup();
			// markers = new ppm.MarkerClusterGroup({ animateAddingMarkers : true });
			map.addLayer(_this.markers);

			// map.on('movestart', logEvent);
			// map.on('move', logEvent);
			// map.on('moveend', logEvent);
			// map.on('zoomstart', logEvent);
			// map.on('zoomend', logEvent);

			// var pageStyle = {
			// 		border: '1px dashed black',
			// 		position: 'relative',
			// 		height: '300px'
			// 	},
			// 	fullStyle = {
			// 		border: 'none',
			// 		position: 'absolute',
			// 		top: 0,
			// 		left: 0,
			// 		width: '100%',
			// 		height: '100%'
			// 	};

			// ppm.DomUtil.get('modePage').onclick = function(e)
			// {
			// 	var isFull = map._container.style.position == 'absolute';
			// 	ppm.extend(map._container.style, isFull ? pageStyle : fullStyle);
				
			// 	map.invalidateSize();

			// 	ppm.DomUtil.get('modePage').innerHTML = !isFull ? 'Page mode' : 'Fullscreen';
				
			// 	// ppm.DomUtil.get('map').style.display = 'none';

			// 	// window.map = new ppm.Map(document.querySelector('.ppm-Map'), {
			// 	// 	center: [43.609, 7.018],
			// 	// 	zoom: 16,
			// 	// 	showControls: true,
			// 	// 	mapStyleControl: true
			// 	// })
			// };

			// Polyfill classList
			_this.roadbookContainer = ppm.DomUtil.get('itinerary-result-step-container');
			// _this.roadbookContainer.classList = new ppm.TokenList(_this.roadbookContainer);
			
			_this.closeBtn = ppm.DomUtil.get('itinerary-result-step-container-close');
			// _this.closeBtn.classList = new ppm.TokenList(_this.closeBtn);




			// ppm.DomUtil.get('modePage').onmousemove = function(e)
			// {
			// 	console.log(e.clientX, e.clientY);
			// };
			
		});
	},

	populate: function ()
	{
		console.log("azeazeza");
		var  _this = this;
		if(!ppm.Infobox.hasTemplate('Markerial'))
			ppm.Infobox.registerTemplate('Markerial', 'Marker&nbsp;{{=id}}!');
		for (var i = 0; i < 10; i++)
		{
			(function(i)
			{
				var marker,
				    pos = app.getRandomLatLng(_this.map);
				
				app.markers.addLayer(marker = new ppm.Marker(pos, {
					/*icon: new ppm.DivIcon({
						iconSize: ppm.point(40, 56),
						iconAnchor: ppm.point(20, 20),
						className: '',
						html: '<div style="width: 40px; height: 56px; overflow: hidden; background: transparent; border: none;"> \
									<img src="http://maps.118712.fr/I/CSCarto_v4.1/Release_4_1_3/POIBar/sprite_pin.png"/> \
								</div>'
					}),*/
					title: "Marker num: " + i,
					draggable: true,
					infoboxData: {
						templateName: 'Markerial', 
						data: {id: i},
						side: 'top',
						offset: new ppm.Point(0, -20),
						map: app.map, 
						anchor: pos,
						animateMove: true
					}
				}));
				
			})(i);
		}
		return false;
	},

	addPoly: function ()
	{
		ppm.modules.Drawing(function()
		{
			app.map.addLayer(poly = new ppm.Polygon([
				[43.609,7.018],
				[43.609,7.017],
				[43.608,7.017],
				[43.608,7.018]
			]));

			new ppm.Rectangle(app.map.getBounds()).addTo(app.map);
		});
	},

	newIti: function(e)
	{
		ppm.modules.Itinerary(function()
		{
			iti = new ppm.Itinerary({
				waypoints: [
					[43.61113,7.01721],
					[43.62570,7.0466]
				],
				draggable: true
				
			});
			iti.addTo(app.map);
			iti.calculate();

			iti.on('roadbookLoaded', this._onRoadbookLoaded.bind(this));
		});
	},

	getRandomLatLng: function (map)
	{
		var bounds = map.getBounds(),
			southWest = bounds.getSouthWest(),
			northEast = bounds.getNorthEast(),
			lngSpan = northEast.lng - southWest.lng,
			latSpan = northEast.lat - southWest.lat;

		return new ppm.LatLng(
				southWest.lat + latSpan * Math.random(),
		        southWest.lng + lngSpan * Math.random());
	},

	_onResize: function ()
	{
		// Fix body sizes
		$('body').add(this.$el).css({width: window.innerWidth, height: window.innerHeight});
		this.$el.css({width: window.innerWidth, height: window.innerHeight});
		
		// Fix page view height and top
		this.$pageView.height(this.$el.height() - this.$header.outerHeight() - this.$tabbar.outerHeight())
						.css("top", this.$header.outerHeight());
		
		// Fix tabBar buttons width
		this.$tabbar.find('li').width(this.$tabbar.width() / $('#tabbar').find('li').length);

		// this.updateHeaderLayout();
		this.map && this.map.POIBar && this.map.POIBar._updateDisplayList();
	},

	_onRoadbookLoaded: function()
	{
		this.roadbookContainer.classList.add('open');
		this.closeBtn.classList.add('open');
		iti.displayRoadbook('itinerary-result-step-container', '{{{var idx = 1}}} \
		                    									{{{var idx_s = 0}}} \
		                    									<table id="itinerary-result-step-box"> \
																    <tr> \
																        <td class="icon"><div class="flag start"></div></td> \
																        <td class="instruction main-step">{=aViaName[0]}}</td> \
																    </tr> \
																    {{@routeLegs}} \
																        {{{ var route = _val}}} \
																        {{@route.itineraryItems}} \
																            {{{ var step = _val}}} \
																            <tr onmouseover="iti._stepsGroup.getLayer( {{=step._step_id}} ).showInfobox();" onmouseout="iti._stepsGroup.getLayer( {{=step._step_id}} ).hideInfobox();"> \
																                <td class="icon"><div class="itinerary-direction32 {{=step.instruction.maneuverType}}"></div></td> \
																                <td>\
																                    <div class="instruction"><span class="step-number{{idx > 99}} wide{{/if}}">{{=idx++}}</span> {{=step.instruction.text}}</div> \
																                    <div id="distance-separator"></div> \
																                    {{step.travelDistance < 1}} \
																                        <div class="distance">{{=step.travelDistance * 1000}} m</div> \
																                    {{:else}} \
																                        <div class="distance">{{=Math.round(step.travelDistance)}} km</div> \
																                    {{/if}} \
																                </td> \
																            </tr> \
																        {{/@route.itineraryItems}} \
																        {{route_index <= routeLegs.length-2}} \
																            <tr> \
																                <td class="icon"><div class="flag waypoint"></div></td> \
																                <td class="instruction main-step">{=aViaName[route_index]}}</td> \
																            </tr> \
																        {{/if}} \
																    {{/@routeLegs}} \
																    <tr> \
																        <td class="icon"><div class="flag end"></div></td> \
																        <td class="instruction main-step">{=aViaName[aViaName.length - 1]}}</td> \
																    </tr> \
																</table>');
	}
};

/**
 * Page Class
 */
var Page = function (node)
{
	this.$el = $(this);
	this.initialize();
}

Page.prototype = {
	// className: "page",
	title: "Page",
	name: "Page",
	icon: null,
	_disabled: false,
	includeInTabBar: false,
	_$parent: null,

	initialize: function ()
	{
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
		// log('iciiiiiiiii Page');
		// this.render();
	},

	show: function (direction)
	{
		direction = typeof direction == 'undefined' ? 1 : direction;
		
		if (this._$parent.find('Page').length)
		{
			// Get the current shown page(s)
			var $old = this._$parent.find('Page').not(this.$el).map(function(i,e){ if($(e).css('display') != "none") return e; });
			var margin = this._$parent.width() * direction,
				_this = this;
			
			this.$el.hide().css({"-webkit-transform": 'translateX(' + margin + 'px)'}).show();
			this.$el.scrollTop(this.$el.attr('scroll'));
			$old.attr('scroll', $old.scrollTop());
			setTimeout(function(){
				_this.$el.css({"-webkit-transform": 'translateX(0)'});
				$old.css({"-webkit-transform": 'translateX(' + (-margin) + 'px)'});
			}, 10);
			
			$old.one("webkitTransitionEnd", function()
			{
				$old.hide();
			});

		}

		/* TODO: This is not cross platform. Jquery has .scrollTop(), but zepto does not. Port? */
		// window.scrollTo(0, 0);
	}
};

/**
 * PageView Class
 */
var PageView = function (node)
{
	this.$el = $(this);
	this.initialize();
}

PageView.prototype = {
	
	initialize: function ()
	{
		var _this = this;
		this.$el.css({display: 'block'});
		this.$el.find('Page').each(function (id, page) { _this.addPage(page); });
	},

	pages: [],
	addPage: function(page)
	{
		var _this = this;
		var pageID = this.pages.push(page) - 1;
		page._$parent = this.$el;
		this.$el.append(page.$el.hide());

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
		}
	}
};




// function Class(klass)
// {
// 	return function(id, node)
// 	{
// 		$.extend(node, klass.prototype);
// 		klass.call(node);
// 	}
// }

(function ( $ ) {
	$.fn.applyClass = function(klass)
	{
	    return this.each(function(id, node) {
	        $.extend(node, klass.prototype);
			klass.call(node);
	    });
	};
}( jQuery ));

