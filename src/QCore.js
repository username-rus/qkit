/*{{QCORE}}*/

//=============================================================================
//----- MAIN ------------------------------------------------------------------
//=============================================================================

Q = {
	cfg: (function () {
		return {
			load: 0,
			tick: 1000, //ms
		};
	}()),
	isRoot: (function () {
		return self.parent == self;
	}()),
	isMain: (function () {
		return self.document ? true : false;
	}()),
	isWork: (function () {
		return self.document ? false : true;
	}()),
	name: (function () {
		return null;
	}()),
	tmp: (function () {
		return {};
	}()),
	utils:(function () {
		return {};
	}()),
	list:(function () {
		return [null];
	}()),
	map:(function () {
		return {};
	}()),
	random: (function () {
		var date = Date.now().toString(16).substring(0, 8);
		var rnd1 = (Math.random()*1e15).toString(16);
		var rnd2 = (Math.random()*1e15).toString(16);
		var rnd3 = (Math.random()*1e15).toString(16);
		
		return {
			local: 1,
			counter: 1,
			
			base: date + rnd1.substring(0, 8),
			shift: rnd2.substring(0, 8) + rnd3.substring(0, 8),
			seed: 1,
		}
		
	}())
};

//=============================================================================
//----- ID SERVICE: ID, UID ---------------------------------------------------
//=============================================================================

QID = function ()
{
	return Q['name'] + '#' + Q['random'].counter++;
};

QUID = function ()
{
	var base = Q['random'].base;
	var shift = Q['random'].shift;
	var seed = Number(Q['random'].seed++).toString(16);
	
	return (base + seed + shift).substring(0, 32);
};

//=============================================================================
//----- IMPORT SERVICE: plain, modules, threads -------------------------------
//=============================================================================


//(воркер/фрейм).метод - где метод, бывшая точка
//(модуль).метод

QDefine = function (info)
{
	if ( info.is == 'frame' )
	{
		Q['name'] = info.name;
		
		//parent
		self.addEventListener('message', Q['utils'].router);
		if ( !Q['isRoot'] )
		{
			Q['list'].push({
				is: 'parent',
				name: null,
				ptr: {
					inst: self.parent,
					postMessage: function (data) {this.inst.postMessage(data, '*');}
				}
			});
		}
	}
	
	if ( info.is == 'worker' )
	{
		Q['name'] = info.name;
		
		//parent
		self.addEventListener('message', Q['utils'].router);
		Q['list'].push({
			is: 'parent',
			name: null,
			ptr: {
				inst: self,
				postMessage: function (data) {this.inst.postMessage(data);}
			}
		});
	}
	
	if ( info.is == 'commandant' )
	{
		Q['map'][info.name] = Q['list'].length;
		Q['list'].push({
			is: 'commandant',
			name: info.name,
			ptr: self.define = {}
		});
	}
	
	if ( info.is == 'calculator' )
	{
		Q['map'][info.name] = Q['list'].length;
		Q['list'].push({
			is: 'calculator',
			name: info.name,
			ptr: self.define = {}
		});
	}
	
	if ( info.is == 'point' )
	{
		Q['map'][Q.name + '/' + info.name] = Q['list'].length;
		Q['list'].push({
			is: 'point',
			name: Q.name + '/' + info.name,
			ptr: self.define = {}
		});
	}
	
	return;
}

QFrame = function ( url, parent )
{
	var base = location.href.substring(0, location.href.lastIndexOf('/') + 1);
	var abs = url.search(/\w\:\/\/.+/) == -1 ? base + url : url;
	
	var frame = document.createElement('iframe');
	
	frame.onload = function ()
	{
		Q['list'].push({
			is: 'frame',
			name: null,
			ptr: {
				inst: frame.contentWindow,
				postMessage: function (data) {this.inst.postMessage(data, '*');}
			}
		});
	}
	
	frame.src = abs;
	parent.appendChild(frame);
	
	return;
};

QWorker = function ( url )
{
	var base = location.href.substring(0, location.href.lastIndexOf('/') + 1);
	var abs = url.search(/\w\:\/\/.+/) == -1 ? base + url : url;
	
	if ( self.Worker )
	{
		var worker = new Worker(abs);
		
		worker.onmessage = Q['utils'].router;
		
		Q['list'].push({
			is: 'worker',
			name: null,
			ptr: {
				inst: worker,
				postMessage: function (data) {this.inst.postMessage(data);}
			}
		});
	}
	else if (Q['isWork'])
	{
		self.postMessage({QKIT: true, dest: null, type: 'delegate', url: abs});
	} 
	else
	{
		throw 'WebWorkers not supported';
	}
	
	return;
};

//plain, point, module_async, module_sync
QModule = function ( url )
{
	var base = location.href.substring(0, location.href.lastIndexOf('/') + 1);
	var abs = url.search(/\w\:\/\/.+/) == -1 ? base + url : url;
	
	Q.cfg.load++;
	
	if ( Q['isWork'] )
	{
		importScripts( abs );
		Q.cfg.load--;
		return;
	}
	else
	{
		var script = document.createElement( 'script' );
		
		script.type = 'text/javascript';
		script.src = abs;
		script.async = true;
		script.onload = function () {Q.cfg.load--;}
		
		document.head.appendChild( script );
	}
	
	return;
};



//=============================================================================
//----- ASYNC FUNCTION SERVICE: root, call, back ------------------------------
//=============================================================================

QCall = function ( cur, name, arg )
{
	if ( Q.cfg.load ) 
	{
		Q['utils'].wait(function ()
		{
			if ( Q.cfg.load ) {return false;}
			QCall(cur, name, arg); return true;
		});
		return;
	}
	
	var nameMod = name.substring(0, name.lastIndexOf('/'));
	var nameMet = name.substring(name.lastIndexOf('/') + 1, name.length);
	var index = Q.map[nameMod];
	
	if ( !index )
	{
		Q['utils'].wait(function ()
		{
			if ( !Q.map[nameMod] ) {return false;}
			
			QCall(cur, name, arg); 
			return true;
		});
		return;
	}
	
	var mod = Q.list[index];
	
	if ( cur && typeof(cur) != 'string' )
	{
		if ( !cur.size[name] ) 
			{cur.size[name] = 1; cur.size['full']++;}
		else 
			{cur.size[name]++; cur.size['full']++;}
	}
	
	if ( typeof(mod.ptr) == 'string' )
	{
		var id = Q['name'] + '#' + Q['random'].local++;
		
		Q['tmp'][id] = cur;
		Q['utils'].router({
			QKIT: true, dest: mod.ptr, type: 'call',
			back: id,
			name: name,
			arg: arg,
		});
	}
	else
	{
		var next = {
			back: cur, name: name,
			from: '#', size: {'full': 0},
			arg: arg, ret: null
		}
		
		try {mod.ptr[nameMet](next);}
		catch (e) {Q['utils'].errorPrintNext(next, Q['utils'].errorPrintBegin(e));}
	}
	
	return;
}

QBack = function ( cur, res )
{
	if ( Q.cfg.load ) 
	{
		Q['utils'].wait(function ()
		{
			if ( Q.cfg.load ) {return false;}
			QBack(cur, res); return true;
		});
		return;
	}
	
	if ( !cur )
	{
		return;
	}
	
	var prev = cur.back;
	
	if ( !prev )
	{
		return;
	}
	
	if (typeof(prev) == 'string')
	{
		Q['utils'].router({
			QKIT: true, dest: prev.substring(0, prev.lastIndexOf('#')), type: 'back',
			back: prev,
			res: res,
		});
	}
	else
	{
		var nameMod = name.substring(0, name.lastIndexOf('/'));
		var nameMet = name.substring(name.lastIndexOf('/') + 1, name.length);
		var index = Q.map[nameMod];
		var mod = Q.list[index];
		
		cur.back = null;
		cur.size = null;
		cur.arg = cur.ret = null;
		
		prev.ret = res;
		prev.from = '#' + cur.name;
		
		try {mod.ptr[nameMet](prev);}
		catch (e) {Q['utils'].errorPrintNext(prev, Q['utils'].errorPrintBegin(e));}
	}
	
	return;
}


QSend = function ( name, arg )
{
	if ( Q.cfg.load ) 
	{
		Q['utils'].wait(function ()
		{
			if ( Q.cfg.load ) {return false;}
			QSend(name, arg); return true;
		});
		return;
	}
	
	var index = Q.map[name];
	
	if ( !index )
	{
		Q['utils'].wait(function ()
		{
			if ( !Q.map[name] ) {return false;}
			
			QSend(name, arg);
			return true;
		});
		return;
	}
	
	var mod = Q.list[index];
	
	if ( typeof(mod.ptr) == 'string' )
	{
		Q['utils'].router({
			QKIT: true, dest: mod.ptr, type: 'point',
			name: name,
			arg: arg
		});
	}
	else
	{
		mod.ptr.main(arg);
	}
	return;
}


QList = function ( arr )
{
	if ( typeof(arr) == 'string' )
	{
		if ( !Q.map[arr] ) {return null;}
		
		var index = Q.map[arr];
		var mod = Q.list[index];
		
		if ( !mod || typeof(mod.ptr) == 'string' )
		{
			return null;
		}
		
		return mod.ptr;
	}
	
	var res = {};
	
	for (var i = 0, ni = arr.length; i < ni; ++i)
	{
		if ( !Q.map[arr[i]] ) {continue;}
		
		var name = arr[i];
		var index = Q.map[name];
		var mod = Q.list[index];
		
		var nLast = name.substring(name.lastIndexOf('/') + 1);
		
		if (!nLast) {continue;}
		
		if ( !mod || typeof(mod.ptr) == 'string' )
		{
			res[nLast] = null;
		}
		else
		{
			res[nLast] = mod.ptr;
		}
	}
	
	return res;
}


//=============================================================================
//----- CORE UTILS ------------------------------------------------------------
//=============================================================================

Q['utils'].errorPrintBegin = function ( e )
{
	var stack = e.stack;
	var out = {
		name: e.toString(),
		line: null,
		trace: []
	};
	
	if ( stack )
	{
		var line = stack.split('\n')[1];
		var index = line.indexOf(location.origin);
		
		out.line = line.substring(index, line.length);
	}
	
	return out;
}

Q['utils'].errorPrintNext = function ( cur, info )
{
	if ( !cur )
	{
		console.log('%c[Error]', 'color: red');
		console.log('%c[!]', 'color: red', info.name);
		console.log('%c[!]', 'color: red', 'Line: ' + info.line);
		console.groupCollapsed('%c[!]', 'color: red', 'Trace');
		for (var i = 0, ni = info.trace.length; i < ni; ++i)
		{
			console.group(info.trace[i].name);
			console.log('Loc: ', info.trace[i].loc);
			console.log('Arg: ', info.trace[i].arg);
			console.log('Con: ', info.trace[i].con);
			console.groupEnd(info.trace[i].name);
		}
		console.groupEnd('Trace');
		return;
	}
	
	if ( typeof(cur) == 'string' )
	{
		Q['utils'].router({
			QKIT: true, dest: cur.substring(0, cur.lastIndexOf('#')), type: 'print',
			back: cur,
			info: info,
		});
	}
	else
	{
		var ban = 'back name from size arg ret';
		var con = {};
		
		for ( var i in cur ) 
		{
			if ( ban.indexOf(i) == -1 ) {con[i] = cur[i];}
		}
		
		info.trace.push({
			name: cur.name,
			arg: JSON.parse(JSON.stringify(cur.arg)),
			loc: Q.name,
			con: JSON.parse(JSON.stringify(con))
		});
		this.errorPrintNext(cur.back, info);
	}
}

Q['utils'].wait = function ( f )
{
	function doWait ()
	{
		if ( !f() ) {setTimeout(doWait, 0);}
	}
	
	doWait ();
	return;
}


Q['utils'].router = function ( event )
{
	var data = event.data || event; if (typeof(data) == 'string') {data = JSON.parse(data);}
	var src = event.source || event.target;
	var context;
	
	if ( !data.QKIT ) 
	{
		return;
	}
	
	if ( data.dest !== null && data.dest != Q.name )
	{
		var index = Q.map[data.dest];
		
		Q.list[index].ptr.postMessage(data);
		return;
	}
	
	for ( var i = 0, ni = Q.list.length; i < ni; ++i )
	{
		var item = Q.list[i];
		
		if ( !item ) {continue;}
		if ( item.ptr.inst == src ) {context = item; break;}
	}
	
	switch ( data.type )
	{
		case 'tick':
			Q['utils']['router/tick'].call(context, data);
			break;
			
		case 'delegate':
			Q['utils']['router/delegate'].call(context, data);
			break;
			
		case 'call':
			Q['utils']['router/call'].call(context, data);
			break;
			
		case 'back':
			Q['utils']['router/back'].call(context, data);
			break;
			
		case 'point':
			Q['utils']['router/point'].call(context, data);
			break;
			
		case 'print':
			Q['utils']['router/print'].call(context, data);
			break;
	}
	
	return;
}

Q['utils']['router/print'] = function ( data )
{
	Q['utils'].errorPrintNext(Q.tmp[data.back], data.info);
	return;
}

Q['utils']['router/delegate'] = function ( data )
{
	if ( Q.isMain )
	{
		QWorker(data.url);
	}
	else
	{
		Q.list[1].ptr.postMessage(data);
	}
}

Q['utils']['router/point'] = function ( data )
{
	var index = Q.map[data.name];
	var mod = Q.list[index];
	
	mod.ptr.main(data.arg);
	return;
}

Q['utils']['router/call'] = function ( data )
{
	QCall(data.back, data.name, data.arg);
	return;
}

Q['utils']['router/back'] = function ( data )
{
	var cur = Q.tmp[data.back]; delete Q.tmp[data.back];
	
	QBack(cur, data.ret);
	return;
}

Q['utils']['router/tick'] = function ( data )
{
	if ( !this.name )
	{
		this.name = data.name;
		
		for ( var i = 0, ni = Q.list.length; i < ni; ++i )
		{
			if ( Q.list[i] == this ) {Q['map'][data.name] = i; break;}
		}
	}
	
	for ( var i = 0, ni = data.list.length; i < ni; ++i )
	{
		var item = data.list[i];
		
		if ( item.name == Q['name'] )
		{
			continue;
		}
		
		if ( Q['map'][item.name] )
		{
			continue;
		}
		
		if ( item.is == 'frame' || item.is == 'worker' )
		{
			item.ptr = this.ptr;
		}
		
		Q['map'][item.name] = Q['list'].length;
		Q['list'].push(item);
	}
	
	return;
}

//[TICK]опрос, обновление о сущностях в других потоках
setInterval(function tick () 
{
	if ( Q.cfg.load ) {return;}
	
	var msg = {
		QKIT: true, dest: null, type: 'tick',
		name: Q['name'],
		list: []
	};
	
	for ( var i = 0, ni = Q['list'].length; i < ni; ++i )
	{
		var item = Q['list'][i];
		
		if ( !item || item.is == 'parent' )
		{
			continue;
		}
		
		if ( (item.is == 'frame' || item.is == 'worker') && item.name )
		{
			msg.list.push({
				is: item.is,
				name: item.name,
				ptr: null
			});
		}
		
		if ( item.is == 'commandant' || item.is == 'point')
		{
			msg.list.push({
				is: item.is,
				name: item.name,
				ptr: (typeof(item.ptr) == 'string') ? item.ptr : Q['name']
			});
		}
	}
	
	var str = JSON.stringify(msg);
	
	for ( var i = 0, ni = Q['list'].length; i < ni; ++i )
	{
		var item = Q['list'][i];
		
		if ( !item )
		{
			continue;
		}
		
		if ( item.is == 'frame' || item.is == 'worker' || item.is == 'parent' )
		{
			item.ptr.postMessage(str);
		}
	}
	
	return;
}, Q.cfg.tick);


