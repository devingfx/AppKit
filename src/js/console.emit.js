/*
console.emit(/instance|error/,'info' 'style:%c text:%s dom:%o js:%O', 'color:red', 'This is the message', node, obj);

console.emit({
    '':'event'.ico
    'Event':'color:red',
    'onConsole':'color:green',
    ' sent by ':0,
    '%o':element
})

*/
var ss = document.getElementsByTagName('script'),
	currentScript = ss[ss.length - 1];
if( currentScript.attributes.level )
    console.level = currentScript.attributes.level.value;


console.emit = function(cats, type)
{
    var a = [].slice.call(arguments, 2);
    //console.log(cats, type, a);
    type = type || 'log';
    console.level && 
        cats.test( console.level ) && 
            console[ type=='group' ? type + ''.collapsed : type ]
                .apply( console, a );
}
console.html = function( node, data )
{
    var args =  [];
    data = data || {};
    if( typeof node === 'string' )
        node = $(node)[0];
    
    if( node.attributes.file && !node.querySelector('file') )
    {
        var stack;
        try{throw new Error()}catch(e){ stack = e.stack; }
        var arr = stack.split('\n')[2].split('/'),
            file = arr[arr.length-1].split(')')[0].trim(),
            xml = stack.split('\n').map(function(str)
            {
                var res = str.match(/\s*at\s*(.*?)\s*\((.*)\)/);
                return '<func'+(res?' file="'+res[2]+'"':'')+'>'+ ( res ? res[1] : str) +'</func>'; 
            });
        node.appendChild($('<file>').text(file)[0]);
    }
    var root = node;
    var _html = window._html = function( node, a )
    {
        if( node == root ) a[0] = new RegExp( node.attributes.level ? node.attributes.level.value : '.*' );
        
        switch( node.localName )
        {
            case 'group':
            case 'groupend':
            case 'error':
            case 'info':
            case 'log':
                a[1] = node.localName == 'groupend' ? 'groupEnd' : node.localName;
                a[2] = '';
            case 'file':
            case 'span':
            case 'header':
            case 'h2':
            case 's':
                node.attributes.c && node.setAttribute( 'class', node.attributes.c.value );
                var style = getComputedStyle( node ), css = '';
                for( var i = 0, n, st; st = style[(n = style[i++])]; )
                    //if( console.html.styles.indexOf(n) != -1 )
                        css += n + ':' + st + ';';
                
                //a[2] += '%c';// + node.innerText + '%c';
                //a.push( css );
                
                for( var i = 0, child; child = node.childNodes[ i++ ]; )
                {
                    if( child.nodeType == 3 && child.nodeValue.trim() != '' )
                    {
                        a[2] += '%c' + child.nodeValue.trim();
                        //console.log(a[2], child)
                        a.push( css )
                    }
                    else if( child.nodeType == 1 )
                        a = _html( child, a );
                }
                if( !node.childNodes.length )
                {
                    a[2] += '%c';// + node.innerText + '%c';
                    a.push( css );
                }
                //a[2] += '%c';
                //a.push('');
            break;
            
            case 'object':
            case 'o':
                a[2] += '%O';
                a.push( eval( data[node.innerText] ) );
                node.innerHTML = '';
            break;

            case 'node':
            case 'n':
                a[2] += '%o';
                a.push( eval( data[node.innerText] ) );
                node.innerHTML = '';
            break;

            /*case 'event':
                var tpl = (node.attributes.icon ? '<span c="icon '+node.attributes.icon.value+'">.</span>' : '') +
                            '<span c="event">Event'+(node.attributes.attribute ? ' attribute' : '')+'</span><br/><span c="type">'+node.attributes.type.value+'</span><span style="color: blue;text-shadow:none;font-weight:normal"> a été lancé par <o>'+data[node.innerText]+'</o></span>',
                    span = document.createElement('span');
                span.innerHTML = tpl;
                span.className = 'event';
                node.nextSibling ? node.parentNode.insertBefore( span, node.nextSibling ) : node.parentNode.appendChild( span );
            break;
            */
            case 'br':
                a[2] += '\n';
            break;
            default:
                if( console.html[node.localName] ) console.html[node.localName]( node, data );
            break;
        }
        
        
        return a;
    }
    
    console._renderer.appendChild( node );
    if( console._renderer.initialized )
    {
        _html( node, args );
        !console.html.keep && console._renderer.removeChild( node );
        console.emit.apply( console, args );
    }
    else
        node.data = data;
    
}

console._renderer = console._renderer || (function()
                                              {
                                                  var c = document.createElement('console');
                                                  with(c.style)
                                                  {
                                                      position = 'absolute';
                                                      left = 1e6+'px';
                                                  }
                                                  document.getElementsByTagName('html')[0].appendChild( c );
                                                  $(window).load( function()
                                                      {console.log('window %cload','color:green')})
                                                  /*
                                                  if( !document.body )
                                                  {
                                                      */document.addEventListener('DOMContentLoaded', function()
                                                      {console.log('document %cDOMContentLoaded','color:red')})
                                                      /*{
                                                          document.body.appendChild( c );
                                                          console._renderer.initialized = true;
                                                          for( var list = [].slice.call(c.children), i = 0, m; m = list[i++]; )
                                                              console.html( m, m.data );
                                                      })
                                                  }
                                                  else
                                                      document.body.appendChild( c );
                                                  */
                                                  c.initialized = true;
                                                  return c;
                                              })();

if( currentScript.attributes.keep )
    console.html.keep = currentScript.attributes.keep.value;

console.html.styles = 'color border background '.split(' ');

console.emit.toIcon = function( svg )
{
    var $vg = $( svg ),
        w = $vg.attr( 'width' ),
        h = $vg.attr( 'height' ),
        dataUri = 'data:image/svg+xml;utf8,' + encodeURI( svg );
    //return dataUri;
    return 'background: #326a78 url("'+dataUri+'") no-repeat center;\
            '+/*background-size:100%;\*/'\
            padding-left:24px;\
            padding-top:10px;\
            padding-bottom:19px;\
            borsder-bottom: 10px solid transparent;\
            '+/*line-height:24px;\*/'\
            font-size:0px;\
            ';
}
String.prototype.iEVENT = console.emit.toIcon('<svg version="1.2" baseProfile="tiny" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" d="M17.502 12.033l-4.241-2.458 2.138-5.131c.066-.134.103-.285.103-.444 0-.552-.445-1-.997-1-.249.004-.457.083-.622.214l-.07.06-7.5 7.1c-.229.217-.342.529-.306.842.036.313.219.591.491.75l4.242 2.46-2.163 5.19c-.183.436-.034.94.354 1.208.173.118.372.176.569.176.248 0 .496-.093.688-.274l7.5-7.102c.229-.217.342-.529.306-.842-.037-.313-.22-.591-.492-.749z"/></svg>');
String.prototype.iEVENTo = console.emit.toIcon('<svg version="1.2" baseProfile="tiny" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" d="M14.5 4h.005m-.005 0l-2.5 6 5 2.898-7.5 7.102 2.5-6-5-2.9 7.5-7.1m0-2c-.562.012-1.029.219-1.379.551l-7.497 7.095c-.458.435-.685 1.059-.61 1.686.072.626.437 1.182.982 1.498l3.482 2.021-1.826 4.381c-.362.871-.066 1.879.712 2.416.344.236.739.354 1.135.354.498 0 .993-.186 1.375-.548l7.5-7.103c.458-.434.685-1.058.61-1.685-.073-.627-.438-1.183-.982-1.498l-3.482-2.018 1.789-4.293c.123-.26.192-.551.192-.857 0-1.102-.89-1.996-2.001-2z"/></svg>');


String.prototype.collapsed = 'Collapsed';// 'Collapsed' or ''
String.prototype.TITLE = 'font-family:sans-serif;line-height:80px;padding:0px 10px;border-radius:10px;font-size:60px;color:#fff;text-shadow:0 1px 0 #ccc,0 2px 0 #c9c9c9,0 3px 0 #bbb,0 4px 0 #B9B9B9,0 5px 0 #aaa,0 6px 1px rgba(0,0,0,0.1),0 0 5px rgba(0,0,0,0.1),0 1px 3px rgba(0,0,0,0.3),0 3px 5px rgba(0,0,0,0.2),0 5px 10px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.2),0 20px 20px rgba(0,0,0,0.15)'
String.prototype.APPKIT = 'color:#fff;font-weight:900;font-size:12px;text-shadow:0 2px 5px #48AC64,0 0 1px #48AC64,0 0 1px #48AC64,0 0 1px #48AC64,0 0 1px #48AC64,0 0 1px #48AC64;';
String.prototype.CORE = 'color:#fff;font-weight:900;font-size:12px;text-shadow:0 0 1px #000,0 0 1px #000,0 0 1px #000,0 0 1px #000,0 0 1px #000;';
String.prototype.METHOD = 'font-weight:900;font-size:12px;text-decoration:underline;';
String.prototype.EVENT_DISP = 'background: url(http://getstarted.ticketmaster.co.uk/sites/default/files/GLOBAL_Contact_0_0.png) no-repeat center -12px;margin-left:-28px;margin-right:-3px;background-size:100%;line-height:22px;font-size:22px;vertical-align:middle;';
String.prototype.EVENT = 'color:#fff;font-weight:900;border-radius:3px 0 0 3px;padding:0 3px;text-shadow:0 1px 1px #000;background:#326a78';
String.prototype.EVENT = 'color:#fff;font-weight:900;padding:0 3px;text-shadow:0 1px 1px #000;background:#326a78';
String.prototype.EVENT_TYPE = 'color:#fff;font-weight:900;border-radius:0 3px 3px 0;padding:0 3px;text-shadow:0 1px 1px #000;background:#4898ac';
String.prototype.EVENT_TYPE = 'color:#fff;font-size:14px;font-weight:100;margin:24px;padding:0 3px;text-shadow:0 1px 1px #000;background:#4898ac';

/*var _log = console.log;
console.log = function() {
  _log.call(console, '%c' + [].slice.call(arguments).join(' '), 'color:transparent;text-shadow:0 0 2px rgba(0,0,0,.5);');
};*/

//console.group('%c%cEvent\n%cmouseout%c a été lancé par %o', ''.iEVENT, ''.EVENT, ''.EVENT_TYPE, '', window);

/*
console.html($('<info c="event">\
    <span c="icon emit"></span>\
    <span c="event">Event<br/></span>\
    <span c="type">click</span>\
    <span style="color: blue;text-shadow:none;font-weight:normal"> a été lancé par <o>window</o></span>\
</info>')[0]);


console.html($('<group file><event type="click" icon="emit">window</event></group>')[0]);
console.html($('<info file><event type="click" icon="listen">window</event></info>')[0]);
console.groupEnd();

console.html($('<info file>Here are some infos.</info>')[0]);
*/

//console.info('%c%cEvent\n%cmouseout%c attrapé par %o', ''.iEVENTo, ''.EVENT, ''.EVENT_TYPE, '', document);



console.emit(/hello/, 'log', '%cWelcome in debugger!', ''.TITLE);