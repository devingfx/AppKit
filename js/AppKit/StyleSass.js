/**
 * StyleSass Class
 */
var StyleSass = NodeClass.extend({
	
	innerSASS: '',
	
	construct: function StyleSass()
	{
		//console.emit(/instance/, 'group', 'Class %cPageView%c instanciated.', ''.APPKIT, '');
		//console.html('<group level="instance">Class <span c="AppKit class">PageView</span> inherits:</group>');
		// console.html('<group level="instance" c="instance"><span c="icon instance">.</span>Class <span c="AppKit class">PageView</span> inherits:</group>');
		this._super();
		
		// var _this = this;
		this.removeAttributeNode( this.attributes.getNamedItem('sass') );
		this.innerSASS = this.innerHTML.toString();
		this.compile();
		
		// console.html('<groupEnd level="instance"/>');
	},

	compile: function()
	{
		var _this = this;
		var vars = (function()
					{
						var str = '';
						for(var n in _this.attributes)
						{
							if( _this.attributes.hasOwnProperty( n ) && n != 'length' )
								str += '$'+_this.attributes[n].localName+': '+_this.attributes[n].value+';';
						}
						return str;
					})();
		// this.innerHTML = vars;
		Sass.compile( vars + this.innerSASS, function( css )
		{
			console.log( _this.innerHTML = css.text );
			
		})
	}
	
});
