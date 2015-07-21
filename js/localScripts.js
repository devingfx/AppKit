// Local scripts needs content to be accessible
var onReady = function()
{
	// Local scripts evaluation
	var localScripts = $("script[type='text/javascript/local']");
	for(var i = 0, sc; sc = localScripts[i]; i++)
		eval("(function(){" + sc.innerHTML + "})").call(sc.parentNode);
};
if(document.attachEvent)
	document.attachEvent('DOMContentLoaded', onReady);
else
	document.addEventListener('DOMContentLoaded', onReady);