/* HTML repeaters
 * 
 * Will repeat
 * 
 */

/*
HTML:
<div id="list">
	<script type="text/html" filter="data.type=='events'">
		<div class="fb-event">
			<img src="https://graph.facebook.com/{data.id}/picture">
			<span class="name">{data.name}</span>
			<span class="loc">{data.location.address}</span>
		</div>
	</script>
</div>

JS:
var list = document.getElementById('list');
Repeater(list);
list.repeat(data);
$('#list').listView('refresh');
//or
list.dataprovider = data;
*/
var Repeater = function(el)
{
	if(el && typeof el.templates == 'undefined')
	{
		el.templates = [];
		var tpls = $('script[type$=html]', el);
		for(var i = 0, s; s = tpls[i]; i++)
		{
			el.templates.push(s);
			el.removeChild(tpls[i]);
		}
		function selectTemplate(data)
		{
			var candidate = "";
			for(var ii = 0, s; s = el.templates[ii]; ii++)
			{
				// console.log('has filter:', s.hasAttribute('filter'), "filter:", s.getAttribute('filter'));
				// console.log('pass filter:', eval(s.getAttribute('filter')));
				if(s.hasAttribute('filter'))
				{
					if(eval(s.getAttribute('filter')))
						return s.innerHTML;
				}
				else if(candidate == "")
					candidate = s.innerHTML;
			}
			return candidate;
		}

		el.template = $('script[type$=html]', el).innerHTML;
		el.render = function(data, index)
		{
			for(var rendered = selectTemplate(data), rule, i = 0; rule = Repeater.rules[i]; i++){
				// console.log(rule.action('', 'name', data));
				rendered = rendered.replace(rule.find, rule.action.bind(el, data, index));
			}
			return rendered;
		};
		el.repeat = function(data)
		{
			if(!this.hasAttribute('repeater.appends'))
				this.innerHTML = "";
			if(typeof data.length != 'undefined')
			{
				for(var i = 0, item; item = data[i]; i++)
				{
					if(this.getAttribute('onbeforerepeat'))
						eval(this.getAttribute('onbeforerepeat'));
					this.innerHTML += this.render(item, i);
					if(this.getAttribute('onrepeat'))
						eval(this.getAttribute('onrepeat'));
				}
			}
			else
			{
				for(var i in data)//html = "", i = 0, l = data.length; i < l; i++)
				{
					if(this.getAttribute('onbeforerepeat'))
						eval(this.getAttribute('onbeforerepeat'));
					this.innerHTML += this.render(data[i], i);
					if(this.getAttribute('onrepeat'))
						eval(this.getAttribute('onrepeat'));
				}
			}
			if(this.getAttribute('onrepeatend'))
				eval(this.getAttribute('onrepeatend'));
		};
		var _dataProvider;
		el.__defineSetter__('dataProvider', function(v)
			{
				_dataProvider = v;
				el.repeat(v);
			});
		el.__defineGetter__('dataProvider', function()
			{
				return _dataProvider;
			});
	}
	return el;
}

Repeater.rules = [
	{
		//  {array{text}}
		find: /\{([^}]*?)\{(.*?)\}\}/g,
		action: function(data, index, found, iterable, tpl)
		{
			// console.log("array {{}}", this, data, found, iterable, tpl);
			var str = "";
			iterable = eval(iterable);
			if(typeof iterable != 'undefined' && typeof iterable.length != 'undefined')
			{
				for(var i = 0, item; item = iterable[i++];)
					str += tpl.replace(Repeater.rules[1].find, Repeater.rules[1].action.bind(this, item, i));
					// str += this.render(item);
			}
			
			// console.log("array {{}}", this, data, found, iterable, tpl);

			// try{
			// 	var val = eval(arguments[1]);
			// }catch(e){}
			// return typeof val != 'undefined' ? val : "";
			return str;
		}
	},
	{
		//  text{var}text
		find: /\{([^}]*?)\}/g,
		action: function(data, index, found, varname)
		{
			try{
				var val = eval(varname);
			}catch(e){}
			// console.log("var {}", this, data, found, varname, val);
			return typeof val != 'undefined' || val != null ? val : "";
		}
	}
];