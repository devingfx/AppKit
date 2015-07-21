var user = {
	coord: {
		lat: null,
		lng: null
	}
}

/**
 * WebApp Class
 */
var WebApp = function(node) {
	this.$el = $(this);
	this.initialize();
}

WebApp.prototype = {
	initialize: function() {
		var _this = this;
		this.ambiguityTpl = ppm.Util.tmpl('\
			<div class="page-title">Il existe différents résultats pour ce que vous avez saisi. Merci de préciser...</div>\
			{{fields["iti-start"].total>1}}\
				<p class="amb-category" data-type="start">Départ <span class="info">({{=fields["iti-start"].total}} résultats)</span><span class="icon">+</span></p>\
				<div class="amb-field" id="amb-field-start" data-type="start">\
					<p>{{=fields["iti-start"].results[0].address.formattedAddress}}</p>\
					<ul>\
						{{@fields["iti-start"].results}}\
							<li {{_key == 0}}class="selected"{{/if}} data-idx={{=_key}}>{{=_val.address.formattedAddress}}</li>\
						 {{/@fields}}\
					</ul>\
				</div>\
			{{:else}}\
				<p class="amb-category">Départ</p>\
				<div class="amb-field">\
					<p>{{=fields["iti-start"].results[0].address.formattedAddress}}</p>\
				</div>\
			{{/if}}\
			{{fields["iti-end"].total>1}}\
				<p class="amb-category" data-type="end">Arrivée <span class="info">({{=fields["iti-end"].total}} résultats)</span><span class="icon">+</span></p>\
				<div class="amb-field" id="amb-field-end" data-type="end">\
					<p>{{=fields["iti-end"].results[0].address.formattedAddress}}</p>\
					<ul>\
						{{@fields["iti-end"].results}}\
							<li {{_key == 0}}class="selected"{{/if}} data-idx={{=_key}}>{{=_val.address.formattedAddress}}</li>\
						 {{/@fields}}\
					</ul>\
				</div>\
			{{:else}}\
				<p class="amb-category">Arrivé</p>\
				<div class="amb-field">\
					<p>{{=fields["iti-end"].results[0].address.formattedAddress}}</p>\
				</div>\
			{{/if}}\
			{{typeof fields["iti-step"] != "undefined"}}\
				{{fields["iti-step"].total>1}}\
					<p class="amb-category" data-type="step">Etape <span class="info">({{=fields["iti-step"].total}} résultats)</span><span class="icon">+</span></p>\
					<div class="amb-field" id="amb-field-step" data-type="step">\
						<p>{{=fields["iti-step"].results[0].address.formattedAddress}}</p>\
						<ul>\
							{{@fields["iti-step"].results}} {{=_key}} {{=_val}}\
								<li {{_key == 0}}class="selected"{{/if}} data-idx={{=_key}}>{{=_val.address.formattedAddress}}</li>\
							 {{/@fields}}\
						</ul>\
					</div>\
				{{:else}}\
					<p class="amb-category">Etape</p>\
					<div class="amb-field">\
						<p>{{=fields["iti-step"].results[0].address.formattedAddress}}</p>\
					</div>\
				{{/if}}\
			{{/if}}\
			<button class="iti-submit button" onclick="submitAmbiguityForm()">Calculer l’itinéraire</button>\
		');
		this.roadbookTpl = ppm.Util.tmpl('\
			{{{var delta = travelInfos.duration,\n\
				hours = Math.floor(delta / 3600) % 24,\n\
				minutes = Math.floor(delta / 60) % 60}}}\
			<div class="page-title" onclick="showPage(\'page-iti-form\')">\
				<div id="rdb-back-btn"></div>\
				<p>\
					<span id="rdb-title-end">vers {{=$("#iti-end").data("dataGeocoded").results[0].address.locality}}</span>\
					<span id="rdb-title-info">\
					{{travelInfos.distance < 1}}\
						{{=Math.round(travelInfos.distance * 1000)}} m,\
					{{:else}}\
						{{=Math.round(travelInfos.distance)}} km,\
					{{/if}}\
					{{hours > 0}}\
						{{=hours}}h{{=minutes}}\
					{{:else}}\
						{{=minutes}} minute{{minutes > 1}}s{{/if}}\
					{{/if}}\
					<span id="rdb-mode-{{=$("#iti-mode").val()}}" class="icon"></span>\
					</span>\
				</p>\
			</div>\
			<table id="roadbook-content">\
				<tr>\
					<td class="icon"><div class="flag start"></div></td>\
					<td class="main-step">{{=$("#iti-start").val()}}</td>\
				</tr>\
				{{@routeLegs}}\
					{{{var route = _val}}}\
					{{@route.itineraryItems}}\
						{{{var step = _val}}}\
						<tr>\
							<td class="icon"><div class="roadbook-direction {{=step.instruction.maneuverType}}"></div></td>\
							<td class="instruction"><span class="number">{{=parseInt(_key) + 1}}.</span> {{=step.instruction.text}}</td>\
						</tr>\
					{{/@route.itineraryItems}}\
					{{route_index <= routeLegs.length-2}}\
						<tr>\
							<td class="icon"><div class="flag waypoint"></div></td>\
							<td class="instruction main-step">{=aViaName[route_index]}}</td>\
						</tr>\
					{{/if}}\
				{{/@routeLegs}}\
				<tr>\
					<td class="icon"><div class="flag end"></div></td>\
					<td class="main-step">{{=$("#iti-end").val()}}</td>\
				</tr>\
			</table>\
		');
		this.$header = $('header');
		this.$pageView = $('PageView');
		this.vendorPrefix = (function() {
			if (ppm.Browser.ie) {
				return 'MS';
			} else if (ppm.Browser.webkit) {
				return 'webkit';
			} else {
				return '';
			}
		})();
		this.cssPrefix = (function() {
			if (_this.vendorPrefix != '') {
				return '-' + _this.vendorPrefix.toLowerCase() + '-';
			} else {
				return '';
			}
		})();

		// Create the map
		this.showMap();

		//Set header icon
		this.$pageView.on('pageDisplayed', function(e){
			setHeaderIcon(e.page.id);
		});

		window.addEventListener('resize', this._onResize.bind(this));
		this._onResize();
	},
	showMap: function() {
		var _this = this;
		ppm.modules.Core(function() {
			var map = _this.map = new ppm.Map(document.querySelector('#map'), {
				center: [43.609, 7.018],
				zoom: 16,
				showControls: false,
				contextMenu: null,
				enablePOIs: true,
				showPOIBar: true,
				showTraffic: showTrafic,
				POIOptions: {
					maxActivablePOITypes: 1,
					disablePOITypesOnMaxReached: false
				},
				POIBarOptions: {
					position: 'cats118712',
					layoutMethod: 'left'/*,
					buttonsDropInPanel: false*/
				}
			});
			
			//Show the POIS recovered from the 118712 LR
			show118712Pois();

            // Set immediate hiding of infoboxes
            ppm.globalInfobox.options.hideDelay = 0;
            
            if(map.options.showPOIBar)
            {

                map.on('POITypesLoaded', function ()
                {
                    var totWidth = ((map.POIManager.POITypesNumber + 1) * 62) + 1;
                    document.getElementsByClassName('ppm-Control-POIBar')[0].style.width = totWidth + 'px';
                    map.POIBar._updateDisplayList();
					new iScroll(document.getElementById('cats118712'), {
						hScroll: true,
						vScroll: false,
						hScrollbar: true
					});
					ppm.Infobox.registerTemplate('infoboxMarker', map.POIManager._customPOITypeBase.template);
                	map.POIManager.on('POIActivated', closePOIBar);
				});
            }

            // _this.markers = new ppm.FeatureGroup();
            // map.addLayer(_this.markers);

			// Toggle the trafic button
			map.on('layeradd layerremove', function(e) {
            // if (e.layer && e.layer.options.type && e.layer.options.type == 'Trafic') {
				if(e.layer && e.layer instanceof ppm.BingTrafficLayer) {
					$('#toolbar-box #trafic-button').toggleClass('selected');
				}
			});

		});
	},
	populate: function() {
		var _this = this;
		if (!ppm.Infobox.hasTemplate('Markerial')) {
			ppm.Infobox.registerTemplate('Markerial', 'Marker&nbsp;{{=id}}!');
		}
		for (var i = 0; i < 10; i++) {
			(function(i) {
				var marker,
						pos = app.getRandomLatLng(_this.map);

				app.markers.addLayer(marker = new ppm.Marker(pos, {
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
	
	_onResize: function() {
		this.$el.css('top', $('#commonHeader').outerHeight());
		this.map && this.map.POIBar && this.map.POIBar._updateDisplayList();
		$('#cats118712-box').css('width', $('body').width() + $('#cats118712-button').outerWidth());
		var styleName = $('WebApp')[0].cssPrefix + 'transform';
		$('#cats118712-box.close').css(styleName, 'translateX(' + -($('body').width()) + 'px)');
		
	}
};

/**
 * Page Class
 */
var Page = function(node) {
	this.$el = $(this);
	this.initialize();
}

Page.prototype = {
	// className: "page",
	title: "Page",
	name: "Page",
	icon: null,
	_disabled: false,
	_$parent: null,
	initialize: function() {
		this.$el.css({display: 'block'});
		this.__defineGetter__("disabled", function() {
			return this._disabled;
		});
		this.__defineSetter__("disabled", function(val) {
			this._disabled = val;
			if (typeof this.$button != "undefined") {
				if (!val) {
					this.$button.removeClass('disabled');
				} else {
					this.$button.addClass('disabled');
				}
			}
		});
	},
	show: function(direction) {
		direction = typeof direction == 'undefined' ? 1 : direction;

		if (this._$parent.find('Page').length) {
			// Get the current shown page(s)
			var $old = this._$parent.find('Page:visible').not(this.$el);
			var _this = this;

			var styleName = $('WebApp')[0].cssPrefix + 'transform';
			this.$el.hide().css(styleName, 'translateX(' + (100 * direction) + '%)').show().css('visibility', 'visible');
			this.$el.scrollTop(this.$el.attr('scroll'));
			$old.attr('scroll', $old.scrollTop());
			setTimeout(function() {
				_this.$el.css(styleName, 'translateX(0)');
				$old.css(styleName, 'translateX(' + (-100 * direction) + '%)');
			}, 10);

			$old.on('transitionend webkitTransitionEnd oTransitionEnd otransitionend', function() {
				// $old.off('transitionend webkitTransitionEnd oTransitionEnd otransitionend').hide();
				$old.off('transitionend webkitTransitionEnd oTransitionEnd otransitionend').css('visibility', 'hidden');
			});

		}

		/* TODO: This is not cross platform. Jquery has .scrollTop(), but zepto does not. Port? */
		// window.scrollTo(0, 0);
	}
};

/**
 * PageView Class
 */
var PageView = function(node) {
	this.$el = $(this);
	this.initialize();
}

PageView.prototype = {
	pages: [],
	currentPage: null,
	initialize: function() {
		var _this = this;
		this.$el.css({display: 'block'});
		this.$el.find('Page').each(function(idx, page) {
			_this.addPage(page);
		});
//		this.pages.length && this.pages[1] && $(this.pages[1]).show();

		//Set the index of the first page
		var idx = 0;
		if (typeof initPageId != 'undefined') {
			var idx = _this._getIdFromIdx(initPageId);
		}

		setHeaderIcon(this.pages[idx].id);
		
		//Display the first page
		this.pages.length && this.pages[idx] && $(this.pages[idx]).css('visibility', 'visible');
	},
	addPage: function(page) {
		var _this = this;
		_this.pages.push(page);
		page._$parent = _this.$el;
		// _this.$el.append(page.$el.hide());
		_this.$el.append(page.$el);
	},
	goToPage: function(pageID) {
		var _this = this;

		if (isNaN(pageID)) {
			pageID = _this._getIdFromIdx(pageID);
		}

		if (_this.pages.length > pageID) {
			var page = _this.pages[pageID], 
					direction = _this.currentPage <= pageID;
			page.show(direction ? 1 : -1);
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
};

(function($) {
	$.fn.applyClass = function(klass) {
		return this.each(function(id, node) {
			$.extend(node, klass.prototype);
			klass.call(node);
		});
	};
}(jQuery));

/**
 * Display the specified page
 * @param string page Page Id or num
 */
function showPage(page) {
	$('PageView')[0].goToPage(page);
}

/**
 * Add marker to the map
 * @param float lat Latitude
 * @param float lng Longitude
 */
function addMarkerOnMap(lat, lng) {
	//Add marker
	var latlng = new ppm.LatLng(lat, lng);
	$('WebApp')[0].marker = $('WebApp')[0].marker||new ppm.Marker(latlng, {
		icon: new ppm.Icon({
			root: '/img/',
			iconUrl: 'pin-search.png',
			iconSize: [45,63],
			iconAnchor: [19,63]
		})
	});
	$('WebApp')[0].marker.setLatLng(latlng);
	$('WebApp')[0].marker.addTo($('WebApp')[0].map);
	$('WebApp')[0].map.setView(latlng, $('WebApp')[0].map.getZoom());
	
	//Display the map page if needed
	if( $('PageView')[0].currentPage != 0) {
		$('PageView')[0].goToPage('page-map');
	}
}

/**
 * Switch itinerary mode
 * @param DOMNode node
 */
function switchItiMode(node) {
	$('.travel-mode').toggleClass('selected');
	document.querySelector('#iti-mode').value = node.dataset.mode;
}

/**
 * Switch between itinerary start and end fields
 */
function switchItiFields() {
	var start = $('#iti-start').val();
	var startDataGeocoded = $('#iti-start').data('dataGeocoded');
	var startGeoloc = $('#iti-start-geoloc').val();
	$('#iti-start').val($('#iti-end').val());
	$('#iti-start').data('dataGeocoded', $('#iti-end').data('dataGeocoded'));
	$('#iti-start-geoloc').val($('#iti-end-geoloc').val());
	$('#iti-end').val(start);
	$('#iti-end').data('dataGeocoded', startDataGeocoded);
	$('#iti-end-geoloc').val(startGeoloc);
}

/**
 * Submit the itinerary form
 */
function submitItiForm() {
	var fields = $('#iti-field-box input[type="text"]');
	ppm.modules.Statik(function() {
		var ready = true;
		var geocode = new ppm.Geocode();
		fields.each(function(idx, elt) {
			//If the field isn't already geocoded and not empty
			if ($('#' + elt.id).val() != '' && typeof $('#' + elt.id).data('dataGeocoded') == 'undefined') {
				//Geocode field
				ready = false;
				geocode.query($('#' + elt.id).val(), function(data){
					$(elt).data('dataGeocoded', data);
					isAllFieldsGeocoded(fields);
				});
			}
		});
		ready && isAllFieldsGeocoded(fields);
	});
}

/**
 * Submit the itinerary on the ambiguity page
 * @returns {undefined}
 */
function submitAmbiguityForm() {
	isAllFieldsGeocoded($('#iti-field-box input[type="text"]'));
}

/**
 * Check if all itinerary fields have been geoceded
 * @param object List of itinerary fields (start, end, step)
 */
function isAllFieldsGeocoded(fields) {
	var hasAmbiguities = false;
	var allFieldsGeocoded = true;
	var geocodedFields = {};
	
	//Check if all fields have been geocoded (i.e. dataGeocoded is set)
	fields.each(function(idx, elt){
		if ($(elt).val() != '') {
			if (typeof $(elt).data('dataGeocoded') == 'undefined') {
				allFieldsGeocoded = false;
			} else {
				geocodedFields[elt.id] = $(elt).data('dataGeocoded');
				if ($(elt).data('dataGeocoded').total > 1) {
					hasAmbiguities = true;
				}
			}
		}
	});

	if (allFieldsGeocoded) {
		
		//Display ambiguity page if needed
		if (hasAmbiguities) {

			//Fill the ambiguity page
			$('#ambiguity-scroll').html($('WebApp')[0].ambiguityTpl({fields:geocodedFields}));

			fields.each(function(idx, elt){
				var type = $(elt).data('type');
				var dataGeocoded = $(elt).data('dataGeocoded');

				if (typeof dataGeocoded != 'undefined') {
					//Set the form field value
					$('#iti-' + type).val(dataGeocoded.results[0].address.formattedAddress);
					//Copy dataGeocoded to ambiguities pages
					$('#amb-field-' + type).data('dataGeocoded', $(elt).data('dataGeocoded'));
					//Select by default the first entry from each ambiguities list
					$(elt).data('dataGeocoded', {
						results:[
							dataGeocoded.results[0]
						],
						total: 1
					});
				}
			});

			//Select ambiguity
			$("#page-ambiguity li").click(function(){
				selectAmbiguity(this);
			});
			
			//Add event to wait the end of transition in order to resize the scroll
			//when the ambiguities is shown/hidden
			$('#page-ambiguity ul').on('transitionend webkitTransitionEnd oTransitionEnd otransitionend', function(){
				$('WebApp')[0].iScrollAmbiguity.refresh();
			})

			//Add event to show/hide ambiguities
			$("#page-ambiguity .amb-category").click(function(){
				var type = $(this).data('type');
				var liHeight = $('#amb-field-' + type + ' li').first().outerHeight(true);
				if ($(this).is('.open')) {
					$('#amb-field-' + type + ' ul').height(liHeight);
					$(this).children('.icon').html('+');
				} else {
					$('#amb-field-' + type + ' ul').height(liHeight * $('#amb-field-' + type + ' li').length);
					$(this).children('.icon').html('-');
				}
				$('#amb-field-' + type).toggleClass('open');
				$(this).toggleClass('open');
			});

			$('PageView')[0].goToPage('page-ambiguity');
			$('WebApp')[0].iScrollAmbiguity.refresh();
			
		}
		
		//Display roadbook page
		else {
			ppm.modules.Itinerary(function() {
				var coord;
				var waypoints = new Array();
				waypoints.push($('#iti-start').data('dataGeocoded').results[0].point.coordinates);
				if (typeof $('#iti-step').data('dataGeocoded') != 'undefined') {
					waypoints.push($('#iti-step').data('dataGeocoded').results[0].point.coordinates);
				}
				waypoints.push($('#iti-end').data('dataGeocoded').results[0].point.coordinates);
				var iti = window.iti = new ppm.Itinerary({
					waypoints: waypoints,
					pedestrian: ($('#iti-mode').val() == 'pedestrian') ? true : false,
					minimizeTime: ($('input[name="iti-optimize"]:checked').val() == 'time') ? true : false,
					avoidTolls: $('#iti-avoid-tolls').is(':checked'),
					avoidHighways: $('#iti-avoid-highways').is(':checked'),
					updateView: true,
					showInfoboxes: false
				});
				iti.addTo($('WebApp')[0].map);
				iti.calculate();

				iti.on('roadbookLoaded', function() {
					iti.displayRoadbook('roadbook-scroll', $('WebApp')[0].roadbookTpl);
					$('PageView')[0].goToPage('page-roadbook');
					$('WebApp')[0].iScrollRoadbook.refresh();
				});
			});
		}
	}
}

/**
 * Select an ambiguity from ambiguities page
 * Update the dataGeocoded field propertie with the specified index
 * @param DOMNode Selected ambiguity (LI node)
 */
function selectAmbiguity(node) {
	var type = $(node).parent().parent().data('type');
	var $itiField = $('#iti-' + type);
	var selectedIdx = $(node).data('idx');

	//Construct the geocoded data for the selected ambiguity
	var dataGeocoded = {results:[], total: 1};
	dataGeocoded.results[0] = $('#amb-field-' + type).data('dataGeocoded').results[selectedIdx];

	//Update the itinerary field with new values
	$itiField.data('dataGeocoded', dataGeocoded);
	$itiField.val($(node).html());
	$('#iti-form #iti-' + type + '-geoloc').val(dataGeocoded.results[0].point.coordinates[0] + ',' + dataGeocoded.results[0].point.coordinates[1]);

	//Update the selected ambiguity
	$('#amb-field-' + type + ' p').html($(node).html());

	//Close group
	$('.amb-category[data-type="' + type + '"]').click();
}
	
/**
 * Display Pois
 * The data is recovery from the dataPois variable
 * @returns {undefined}
 */
function show118712Pois() {
	if (typeof dataPois != 'undefined') {
		
		//Add markers to the map
		var latLngBounds = [];
		for (i=0, max=dataPois.length; i < max; i++) {
			var latlng = new ppm.LatLng(dataPois[i].lat, dataPois[i].lng);
			latLngBounds.push(latlng);
			marker = new ppm.Marker(latlng, {
				icon: new ppm.Icon({
					root: '/img/',
					iconUrl: 'pin-search.png',
					iconSize: [45,63],
					iconAnchor: [19,63]
				}),
				infobox: {
					templateName: 'infoboxMarker',
					data: ppm.extend(dataPois[i].data, {latitude: dataPois[i].latitude, longitude:dataPois[i].longitude})
				}
			});
			marker.addTo($('WebApp')[0].map);
		}
		
		//The bounds of the map are set to display all markers
		//animation is disabled to prevent a crash with the zoom setting 
		$('WebApp')[0].map.fitBounds(new ppm.LatLngBounds(latLngBounds), {
			paddingTopLeft: new ppm.Point(63, 23),
			paddingBottomRight: new ppm.Point(66, 23),
			animate: false
		});
		
		//Dezoom if the zoom if too close
		//animation is disabled to prevent a crash
		if ($('WebApp')[0].map.getZoom() > $('WebApp')[0].map.getMaxZoom() - 4) {
			$('WebApp')[0].map.setZoom($('WebApp')[0].map.getMaxZoom() - 4, {animate: false});
		}
	}
}

/**
 * Set the header icon according to the displayed page
 */
function setHeaderIcon(pageId) {
	var $button = $('.c118_annu_common_header .liste');
	var $buttonSpan = $button.children('span');
	var $buttonA = $button.children('a');
	switch (pageId) {
		case 'page-iti-form':
			$button.addClass('hidden');
			break;
		case 'page-roadbook':
			$button.removeClass('hidden');
			$buttonSpan.removeClass().addClass('P_T_bouton_iti');
			$buttonA.off().click(function() {
				showPage('page-map');
			});
			break;
	}
}

function closePOIBar()
{
	var styleName = $('WebApp')[0].cssPrefix + 'transform';
	$('#cats118712-box').css(styleName, 'translateX(' + -($('body').width()) + 'px)');
	$('#cats118712-box').removeClass('open');
	$('#cats118712-box').addClass('close');
	$('#toolbar-button').addClass('down');
	app.map.POIBar._morePanel.hide();
}

var doms = {
		"http://arp-portal-plan-touch.mbernard.pooll.dev.118712.fr": 	"http://touch.dev004.118712.fr",
		"http://arp-portal-plan-touch.gdalle.pooll.dev.118712.fr": 		"http://touch.dev004.118712.fr",
		"http://arp-portal-plan-touch.tdigregorio.pooll.dev.118712.fr": "http://touch.dev004.118712.fr",
		"http://touch.plan.dev.118712.fr": 								"http://touch.dev004.118712.fr",
		"http://touch.plan.rec.118712.fr": 								"http://touch.qualif.118712.fr",
		"http://touch.plan.preprod.118712.fr": 							"http://touch.preprod.118712.fr",
		"http://touch.plan.118712.fr": 									"http://touch.118712.fr"
	},
	dom118 = doms[document.location.origin];

$(function() {

	window.app = $('#app').applyClass(WebApp)[0];
	$('Page').applyClass(Page);
	$('PageView').applyClass(PageView);

//	if (navigator.geolocation) {
//		navigator.geolocation.getCurrentPosition(
//			//Succès
//			function(position) {
//console.log('GEOLOC OK');
//				user.coord.lat = position.coords.latitude;
//				user.coord.lng = position.coords.longitude;
//			},
//			//Erreur
//			function(error) {
//console.log('GEOLOC PAS MARCHE');				
//			},
//			{
//				timeout: 5000,
//				enableHighAccuracy: true
//			}
//		);
//	}

	//Init the form in the 118712 header
	//Set form action and hidden params according to the data118712 mode
	if (typeof data118712 != 'undefined') {
		var param = {};
		switch (data118712.mode) {
			case 'lr':
				$('#c118_form_link').attr('action', TOUCH_118712_URL + '/?s=' + data118712.search);
				$('#c118_form_link').append('<input type="hidden" name="current" value="' + data118712.current + '"/>');
				param = {
					current: data118712.current,
					s: data118712.search,
					c118_gstat: $('#c118_form_link input[name="c118_gstat"]').val()
				};
				$('#c118_form_link a').click(function(){
					$.post('/sign', param, function(data){
						$('#c118_form_link').append('<input type="hidden" name="sign" value="' + data + '"/>');
						$('#c118_form_link').submit();
					});
				});
				break;
			case 'subscribers':
			case 'sponsored':
				$('#c118_form_link').attr('action', TOUCH_118712_URL + dataPois[0].external_url);
				$('#c118_form_link a').click(function(){
					$('#c118_form_link').submit();
				});
				break;
		}
	}
	
	//Init the scrolling into pages
	//NOTE : the empty <div id="xxx-scroll"> inside the <Page id="page-xxx"> node must be keep.
	//iScroll need it to work well
	$('WebApp')[0].iScrollAmbiguity = new iScroll($('#page-ambiguity')[0], {
		hScroll: false,
		vScroll: true,
		hScrollbar: true,
		bounce: false
	});
	$('WebApp')[0].iScrollRoadbook = new iScroll($('#page-roadbook')[0], {
		hScroll: false,
		vScroll: true,
		hScrollbar: true,
		bounce: false
	});

	// Click anywhere in app to close settings menu
	$('body').click(function(e) {
		if (e.target != $('#toolbar-button')[0]) {
			$('WebApp').removeClass('menu-open');
			$('#toolbar-box').removeClass('open');
		}
	});
	
	//Set the width of the POIs bar
	$('#cats118712-box').css('width', $('body').width() + $('#cats118712-button').outerWidth());
	
	//Close POIs bar on any click on the page
	//except on the toolbar button
	$('#page-map, #commonHeader').click(function(e)
	{
		var avoid = [
				'.ppm-Control-POIBar',
				'#toolbar-button',
				'#toolbar-box'
			].join(',');

		if ($('#cats118712-box').is('.open') && !$(e.target).closest(avoid).length)
		{
			closePOIBar();
		}
	});

	//Open POIs bar
	$('#cats118712-button').click(function() {
		var styleName = $('WebApp')[0].cssPrefix + 'transform';
		$('#cats118712-box').css(styleName, 'translateX(0)');
		$('#cats118712-box').addClass('open');
		$('#cats118712-box').removeClass('close');
			$('#toolbar-button').removeClass('down');
		return false;
	});
/*
	//Cancel closing POIs bar (ie when sliding POIs)
	$('#cats118712-box').click(function(){
		return false;
	});
*/
	$('#toolbar-button').click(function() {
		$('#toolbar-box').toggleClass('open');
		$('WebApp').toggleClass('menu-open');
	});
	$('#layer-buttons').click(function(e) {
		$('WebApp')[0].map.mapStyleControl.toggleStyle($(e.target).data('layer'), true);
		$(this).children().removeClass('selected');
		$(e.target).addClass('selected');
	});
	$('#toolbar-box #trafic-button').click(function() {
		$('WebApp')[0].map.mapStyleControl.toggleStyle('Trafic');
	});
	
	//###Remove field geocoded data on change
	$('#iti-field-box input[type="text"]').each(function(idx, elt){
		$(elt).change(function(){
			$(elt).removeData('dataGeocoded');
			$('#' + elt.id + '-geoloc').attr('value', '');
		});
	});
	
	//Search from header
	$('.header_search_form').submit(function(){
		ppm.modules.Statik(function() {
			var geocode = new ppm.Geocode();
			var search = $('#header_popin_search').val();
			geocode.query(search, function(data){
				//Display the first marker in the list
				if (data.total > 0) {
					var coordinates = data.results[0].point.coordinates;
					addMarkerOnMap(coordinates[0], coordinates[1]);
				}

				//Show ambiguities message if needed
				if (data.total > 1) {
					//Get current page
					$page = $('Page:visible').append('<div id="ambiguity-box"><a href="javascript:;">Il existe d\'autres résultats pour <b>' + search + '</b>.<br/><span class="blue">Les afficher ?</span></a><div id="ambiguity-close-button"><div class="icon"></div></div></div>');
					$('#ambiguity-box a').css('width', function() {
						return $('body').width() - 40;
					});
					//Enable close button
					$('#ambiguity-close-button').click(function(){
						$('#ambiguity-box').remove();
					});
					//Fill the ambiguity page
					$('#page-ambiguity').html(function(){
						var html = '<div class="page-title">Il existe différents résultats pour ce que vous avez saisi. Merci de préciser...</div>';
						html += '<ul>';
						for (var i in data.results) {
							if (data.results.hasOwnProperty(i)) {
								coordinates = data.results[i].point.coordinates;
								html += '<li data-lat="' + coordinates[0] + '" data-lng="' + coordinates[1] + '">' + data.results[i].address.formattedAddress + '</li>';
							}
						}
						html += '</ul>' +
							'<br/><a href="javascript:;" onclick="showPage(\'page-map\')">Retour</a>' +
							'<script type="text/javascript">' +
								'$("#page-ambiguity li").click(function(){' +
									'addMarkerOnMap($(this).data("lat"), $(this).data("lng"))' +
								'})' +
							'</script>';
						return html;
					});
					//Display the ambiguity page on click
					$('#ambiguity-box a').click(function(){
						$('#toolbar-box').removeClass('open');
						$('PageView')[0].goToPage('page-ambiguity');
					});
				}
			});
		});
		return false;
	});
	
});