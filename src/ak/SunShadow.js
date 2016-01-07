/**
 * SunShadow Class
 */
Package('ak.*');
var SunShadow = ak.SunShadow = class SunShadow extends ak.NodeClass {
	
	SunShadow()
	{
		console.html('<group level="instance" c="instance"><span c="icon instance">.</span>Class <span c="AppKit class">SunShadow</span> inherits:</group>');
		this._super();
		
		this.$el.css({display: 'block'});
		
		console.html('<groupEnd level="instance"/>');
	}
	
	_generateShadow( n, x, y )
	{
	    var css = [];
	    
	    for(var i = 0; i < n; i++)
	        css.push( (n-i)*x/100+'px '+((n-i)*y/100)+'px '+1+'px rgba(0, 0, 0, '+(0.1/n)*(n-i)+')' );
	    
	    return css.join(',');
	}
}

$(function()
{
	$('[sun]').applyClass( SunShadow );
	function momove(e)
	{
		$('[sun]').each(function()
		{
			$(this).css({ textShadow: this._generateShadow( 50, e.screenX, e.screenY ) })
		});
	}
	window.addEentListener( 'mousemove', momove );
})