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
// when loading the worker api via script[src$="/sass.js"] it's a safe bet the worker
// will be found relative to that file. In any other case you'd have to define where
// the worker is located before initializing Sass:
// Sass.setWorkerUrl('./libs/sass.worker.js');
// var sass = new Sass();
// sass.writeFile('testfile.scss', '@import "sub/deeptest";\n.testfile { content: "loaded"; }', function() {
// 	console.log('wrote "testfile.scss"');
// });
// sass.writeFile('sub/deeptest.scss', '.deeptest { content: "loaded"; }', function() {
// 	console.log('wrote "sub/deeptest.scss"');
// });
// sass.options({ style: Sass.style.expanded }, function(result) {
// 	console.log("set options");
// });
// sass.compile('@import "testfile";', function(result) {
// 	console.log("compiled", result.text);
// });