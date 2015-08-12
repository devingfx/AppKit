!console.html && (console.html = function(){});

/**
 * Executes <script> tag with type="text/javascript/local" in context of parentNode
 */
function localScript(root)
{
	var root = root || $('html');
	root.find('script[type="text/javascript/local"]').each(function ()
	{
		if(!this.executed)
		{
			this.executed = true;
			//console.emit(/instance/, 'info', 'Executing local script', this);
			console.html('<info level="instance">Executing local script</info>')
			eval('(function(){' + this.innerHTML +'})').call(this.parentNode);
		}
	});
}


(function ( $ ) {
	$.fn.applyClass = function(klass)
	{
		return this.each(function(id, node) {
			//console.emit(/instance/, 'group', 'Resolving  %o', node);
			console.html('<group>Resolving  <n>node</n></group>', {node: node});
			$.extend(node, klass.prototype);
			klass.call(node);
			//console.emit(/instance/, 'groupEnd');
			console.html('<groupEnd level="instance"/>');
		});
	};
}( jQuery ));

var AppKitClass = NodeClass.extend({
	
	responsizes: [],
	manifest: {},
	//debug: false,
	
	construct: function AppKitClass()
	{
		this._super();
		
	},
	
	preinitialize: function()
	{
		if( this._preinitialized ) return;
		this._preinitialized = true;
		
		this._super();
		
		var manifest = this.attributes.manifest ? this.attributes.manifest.value : this.innerHTML;
		
		//try{
			var obj = eval('(' + manifest + ')');
			for(var n in obj)
				this.manifest[n] = obj[n];
		//}catch(e){}
		
		// Resolve manifest classes
		if(this.manifest)
		{
			for(var selector in this.manifest)
				$(selector).applyClass( this.manifest[selector] );
		}

		// Resolve last local scripts
		localScript();

		// Define bindings
		bindings( document.body, true );
		
		// (Very) simple responsive helper
		if( /mobile/i.test(navigator.userAgent) )
			$('html').addClass('mobile');
		else
			$('html').addClass('desktop');
		
		// $('html').trigger('preinitialize');
		// this.dispatchEvent(new Event('preinitialize'));
		document.getElementsByTagName('html')[0].dispatchEvent(new Event('preinitialize'));
	},
	
	initialize: function()
	{
		if( this._initialized ) return;
		this._super();
		// this.dispatchEvent(new Event('initialize'));
		
		document.getElementsByTagName('html')[0].dispatchEvent(new Event('initialize'));
	}
});


// Look the reference to the script node that loaded this script and extract the manifest attribute.
(function(){
	var ss = document.getElementsByTagName('script'),
		AppKit = window.AppKit = ss[ss.length - 1];
	
	$( AppKit ).applyClass( AppKitClass );
	
	// On document ready launch preinitialize chain
	$( AppKit.preinitialize.bind(AppKit) );
	
	// On window load launch initialize chain
	window.addEventListener( 'load', AppKit.initialize.bind( AppKit ) );
})();
