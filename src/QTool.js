/*{{QTOOL}}*/

if ( !Q )
{
	throw 'QCore should be included before QTool';
}

setTimeout(function ()
{
	if ( !self.document )
	{
		return;
	}
	
	//=============================================================================
	//----- MAKE SERVICE: src, dest -----------------------------------------------
	//=============================================================================
	
	var http = function ( url, ready )
	{
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function () 
		{
			if (xhttp.readyState != 4) {return;}
			if ( xhttp.response == null ) {throw 'Not exist: ' + url;}
			
			ready(xhttp.response);
		}
		xhttp.responseType = 'text';
		xhttp.open( 'GET', url, true );
		xhttp.send();
	};
	
	var src = function ( url, ready )
	{
		var This = this;
		var counter = 0;
		var base = url.substring(0, url.lastIndexOf('/') + 1);
		
		this.url = url;
		this.text = [];
		this.plain = [];
		this.modules = [];
		this.threads = [];
		
		var regThread = /QThread\s*\(\s*['"]([^'"]+?)['"]\s*\)\s*;?/g;
		var regModule = /QModule\s*\(\s*['"]([^'"]+?)['"]\s*\)\s*;?/g;
		var regPlain = /QPlain\s*\(\s*['"]([^'"]+?)['"]\s*\)\s*;?/g;
		var regImport = /importScripts\s*\(\s*['"]([^'"]+?)['"]\s*\)\s*;?/g;
		var regScriptTag = /<script\s*[^>]*>[^]*?<\/script>/g;
		var regScriptSrc = /src\s*=\s*['"](.+?)['"]/;
		var regScriptBody = /<script\s*[^>]*>([^]*?)<\/script>/;
		var regComment = /\/\/.*|\/\*[^]*?\*\//g;
		
		http(url, function (res)
		{
			if ( res.indexOf('/*{{QTOOL}}*/') != -1 ) {ready(This); return;}
			
			if ( url.lastIndexOf('.js') == -1 )
			{
				for ( var i = regScriptTag.exec(res); i; i = regScriptTag.exec(res) )
				{
					var href = regScriptSrc.exec(i[0]);
					var body = regScriptBody.exec(i[0]);
					
					if ( href && href[1] ) 
					{
						counter++;
						This.plain.push(new src(base + href[1], function () {
							if ( --counter == 0 ) {ready(This);}
						}));
					}
					if ( body && body[1] ) 
					{
						This.text.push(body[1]);
					}
				}
			}
			
			if ( url.lastIndexOf('.js') >= 0 )
			{
				This.text.push(res.replace(regImport, '').replace(regComment, ''));
			}
			
			for ( var i = regThread.exec(res); i; i = regThread.exec(res) )
			{
				counter++;
				This.threads.push(new src(base + i[1], function () {
					if ( --counter == 0 ) {ready(This);}
				}));
			}
			
			for ( var i = regModule.exec(res); i; i = regModule.exec(res) )
			{
				counter++;
				This.modules.push(new src(base + i[1], function () {
					if ( --counter == 0 ) {ready(This);}
				}));
			}
			
			for ( var i = regPlain.exec(res); i; i = regPlain.exec(res) )
			{
				counter++;
				This.plain.push(new src(base + i[1], function () {
					if ( --counter == 0 ) {ready(This);}
				}));
			}
			
			for ( var i = regImport.exec(res); i; i = regImport.exec(res) )
			{
				counter++;
				This.plain.push(new src(base + i[1], function () {
					if ( --counter == 0 ) {ready(This);}
				}));
			}
			
			if ( counter == 0 ) {ready(This);}
		});
		
		return this;
	}
	
	var dest = function ( node, out )
	{
		var arr = [];
		
		for ( var i = 0, ni = node.plain.length; i < ni; ++i )
		{
			arr.push(dest(node.plain[i], null));
		}
		
		if ( out )
		{
			arr.push("\n");
			arr.push("Q['!cfg'].loading.thread = -1;\n");
			arr.push("Q['!cfg'].loading.module = -1;\n");
			arr.push("Q['!cfg'].loading.plain = -1;\n");
			arr.push("\n");
		}
		
		for ( var i = 0, ni = node.text.length; i < ni; ++i )
		{
			arr.push(node.text[i]);
		}
		
		for ( var i = 0, ni = node.modules.length; i < ni; ++i )
		{
			arr.push(dest(node.modules[i], null));
		}
		
		for ( var i = 0, ni = node.threads.length; i < ni; ++i )
		{
			dest(node.threads[i], out);
		}
		
		if ( out )
		{
			out.push({url: node.url, data: arr.join('\n')});
		}
				
		return arr.join('\n');
	}
	
	//=============================================================================
	//----- INTERFACE CONSTRUCTOR SERVICE: html -----------------------------------
	//=============================================================================
	
	var html = function ( name )
	{
		this.html = document.createElement(name);
		this.parent = null;
		this.child = null;
		this.next = null;
		this.prev = null;
		
		this.mapStyle = {};
		this.mapAttr = {};
		this.handlers = [];
		
		this.html.wrap = this;
		
		return this;
	}
	
	html.prototype.attr = function ()
	{
		var html = this.html;
		var map = this.mapAttr;
		
		for ( var i = 0, ni = arguments.length; i < ni; ++i )
		{
			var pair = arguments[i].match(/\s*([^: ]+)\s*=\s*([^]+)/);
			
			map[pair[1]] = pair[2];
			html.setAttribute(pair[1], pair[2]);
		}
		
		return this;
	}
	
	html.prototype.style = function ()
	{
		var html = this.html;
		var map = this.mapStyle;
		
		for ( var i = 0, ni = arguments.length; i < ni; ++i )
		{
			var pair = arguments[i].match(/\s*([^: ]+)\s*:\s*([^]+)/);
			
			map[pair[1]] = pair[2];
		}
		
		var str = [];
		
		for ( var i in map ) {str.push(i, ': ', map[i], '; ')}
		
		html.setAttribute('style', str.join(''));
		
		return this;
	}
	
	html.prototype.append = function ( x )
	{
		var parent = x.parent || this;
		var child = x.child || this;
		
		child.next = parent.child;
		child.prev = null;
		child.parent = parent;
		parent.child = child;
		
		parent.html.appendChild(child.html);
		
		return this;
	}
	
	html.prototype.remove = function ( x )
	{
		var parent = x.parent || this;
		var child = x.child || this;
		
		if ( parent.child == child )
		{
			parent.child = child.next;
		}
		
		if ( child.prev )
		{
			child.prev.next = child.next;
		}
		
		if ( child.next )
		{
			child.next.prev = child.prev;
		}
		
		child.parent = null;
		child.prev = null;
		child.next = null;
		
		parent.html.removeChild(child.html);
		
		return this;
	}
	
	html.prototype.copy = function ()
	{
		var copy = new html(this.html.tagName);
		var mapAttr = this.mapAttr;
		var mapStyle = this.mapStyle;
		var handlers = this.handlers;
		
		for (var i in mapAttr)
		{
			copy.mapAttr[i] = mapAttr[i];
			copy.html.setAttribute(i, mapAttr[i]);
		}
		
		var arr = [];
		for (var i in mapStyle)
		{
			copy.mapStyle[i] = mapStyle[i];
			arr.push(i, ': ', mapStyle[i], '; ');
		}
		copy.html.setAttribute('style', arr.join(''));
		
		for (var i = 0, ni = handlers.length; i < ni; ++i)
		{
			copy.html.addEventListener(handlers[i].on, handlers[i].f);
		}
		
		return copy;
	}
	
	html.prototype.inner = function (x)
	{
		if (x.text !== undefined)
		{
			this.html.textContent = x.text;
		}
		
		if (x.html !== undefined)
		{
			this.html.innerHTML = x.html;
		}
		
		return this;
	}
	
	html.prototype.store = function (name, val)
	{
		this[name] = val;
		
		return this;
	}
	
	html.prototype.handler = function (on, f)
	{
		this.handlers.push({on: on, f: f});
		this.html.addEventListener(on, f);
		
		return this;
	}
	
	//=============================================================================
	//----- INTERFACE STRUCTURE ---------------------------------------------------
	//=============================================================================
	
	var xWindow = new html('div')
		.attr('id=QTool-window')
		.style('position: absolute', 'z-index: 1000000000')
		.style('left: 2%', 'top: 3%', 'width: 96%', 'height: 94%')
		.style('background-color: #7DB1C7', 'border-radius: 15px');
	
	var lColumn = new html('div')
		.attr('id=QTool-lColumn')
		.style('position: absolute')
		.style('left: 0.5%', 'top: 1%', 'width: 30%', 'height: 98%')
		.style('background-color: #7DB1C7', 'border-radius: 10px')
		.append({parent: xWindow});
		
	var rColumn = new html('div')
		.attr('id=QTool-rColumn')
		.style('position: absolute')
		.style('right: 0.5%', 'top: 1%', 'width: 68.5%', 'height: 98%')
		.style('background-color: #7DB1C7', 'border-radius: 10px')
		.append({parent: xWindow});
		
	var lToolbar = new html('div')
		.attr('id=QTool-lToolbar')
		.style('position: absolute')
		.style('left: 0%', 'top: 0%', 'width: 98%', 'height: 5%', 'min-height: 5%', 'max-height: 5%')
		.style('background-color: #5D605D', 'border-radius: 10px 10px 0px 0px')
		.style('font-size: 120%', 'text-align:center', 'padding: 1%')
		.append({parent: lColumn});
		
	var rToolbar = new html('div')
		.attr('id=QTool-rToolbar')
		.style('position: absolute')
		.style('left: 0%', 'top: 0%', 'width: 100%', 'height: 5%')
		.style('background-color: #5D605D', 'border-radius: 10px 10px 0px 0px')
		.append({parent: rColumn});
		
	var lContent = new html('div')
		.attr('id=QTool-lContent')
		.style('position: absolute')
		.style('left: 0%', 'top: 5%', 'width: 100%', 'height: 95%', 'max-height: 95%')
		.style('background-color: #FFFFFF', 'border-radius: 0px 0px 0px 10px', 'overflow-y: scroll')
		.append({parent: lColumn});
		
	var rContent = new html('div')
		.attr('id=QTool-rContent')
		.style('position: absolute')
		.style('left: 0%', 'top: 5%', 'width: 100%', 'height: 95%')
		.style('background-color: #FFFFFF', 'border-radius: 0px 0px 0px 10px', 'overflow-y: scroll')
		.append({parent: rColumn});
		
	var packButton = new html('input')
		.attr('id=QTool-rToolbar-pack', 'type=button', 'value=pack')
		.style('position: absolute')
		.style('left: 0.8%', 'top: 10%', 'width: auto', 'height: auto', 'font-size: 150%')
		.style('border-radius: 5px')
		.append({parent: rToolbar});
		
	var tmpListHelp = new html('div')
		.attr('id=QTool-list-help')
		.style('position: relative', 'cursor: default')
		.style('padding: 4%', 'margin: 1%', 'width: 90%', 'height: auto', 'font-size: 120%')
		.style('text-align: center', 'border-radius: 5px', 'background-color: #A9E147')
		.handler('mouseover', function () {this.wrap.style('background-color: red')})
		.handler('mouseout', function () {this.wrap.style('background-color: #A9E147')})
		.handler('click', function () 
		{
			rContent.inner({html: ''}).style('overflow: scroll').inner({text: help});
			lToolbar.inner({html: ''}).inner({text: this.textContent});
		});
		
	var tmpListItem = new html('div')
		.attr('id=QTool-list-item')
		.style('position: relative', 'cursor: default')
		.style('padding: 4%', 'margin: 1%', 'width: 90%', 'height: auto', 'font-size: 120%')
		.style('text-align: center', 'border-radius: 5px', 'background-color: #A9E147')
		.handler('mouseover', function () {this.wrap.style('background-color: red')})
		.handler('mouseout', function () {this.wrap.style('background-color: #A9E147')})
		.handler('click', function () 
		{
			rContent.inner({html: ''}).style('overflow: hidden');
			lToolbar.inner({html: ''}).inner({text: this.textContent});
			
			new html('textarea')
			.attr('id=QTool-rContent-text')
			.style('position: relative')
			.style('margin: 1%', 'width: 98%', 'height: 98%', 'resize: none')
			.style('background-color: white')
			.inner({text: this.wrap.data})
			.append({parent: rContent});
		});
		
		
		
	//=============================================================================
	//----- INTERFACE HANDLERS ----------------------------------------------------
	//=============================================================================
	
	packButton.html.addEventListener('click', function (e) 
	{
		var url = location.href;
		if ( url.substring(url.lastIndexOf('.')) != '.html' )
		{
			url += 'index.html';
		}
		
		new src(url, function (node)
		{
			var list = [];
			dest(node, list);
			
			for ( var i = 0, ni = list.length; i < ni; ++i )
			{
				var url = list[i].url.substring(list[i].url.indexOf('://') + 3);
				
				tmpListItem.copy()
				.store('data', list[i].data)
				.inner({text: url.substring(url.indexOf('/') + 1)})
				.append({parent: lContent});
			}
		});
		
	})
	
	
	document.addEventListener('keypress', function (e) 
	{
		if ( e.code != 'Space' || e.shiftKey != true )
		{
			return;
		}
		
		var window = document.getElementById('QTool-window');
		
		if ( document.getElementById('QTool-window') )
		{
			lContent.inner({html: ''});
			rContent.inner({html: ''});
			document.body.removeChild(window);
		}
		else
		{
			document.body.appendChild(xWindow.html);
			
			rContent.inner({html: ''}).inner({text: help});
			lToolbar.inner({html: ''}).inner({text: 'HELP'});
			tmpListHelp.copy().inner({text: 'HELP'}).append({parent: lContent});
		}
	});
	
	var help = `
		Help wil be in future version
	`;
		
	
}, 0);








