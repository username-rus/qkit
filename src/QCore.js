/*{{QCORE}}*/

//=============================================================================
//----- MAIN ------------------------------------------------------------------
//=============================================================================

Q = {
	'!cfg': (function () {
		return {
			loading: {plain: 0, module: 0, thread: 0},
			timeout: {dispatch: 2000, process: 2000}, //cycles
			tick: 100, //ms
		};
	}()),
	'!isMain': (function () {
		return self.document ? true : false;
	}()),
	'!isWork': (function () {
		return self.document ? false : true;
	}()),
	'!name': (function () {
		return null;
	}()),
	'!tmp': (function () {
		return {};
	}()),
	'!utils':(function () {
		return {};
	}()),
	'!queue':(function () {
		return {handlers: {}, timeout: {}, dispatch: [], process: []};
	}()),
	'!threads': (function (){
		return {};
	}()),
	'!modules': (function () {
		return {};
	}()),
	'!random': (function () {
		var date = Date.now().toString(16).substring(0, 8);
		var rnd1 = (Math.random()*1e15).toString(16);
		var rnd2 = (Math.random()*1e15).toString(16);
		var rnd3 = (Math.random()*1e15).toString(16);
		
		return {
			counter: 0,
			
			base: date + rnd1.substring(0, 8),
			shift: rnd2.substring(0, 8) + rnd3.substring(0, 8),
			seed: 0,
		}
		
	}())
};

//=============================================================================
//----- ID SERVICE: ID, UID ---------------------------------------------------
//=============================================================================

QID = function ()
{
	return Q['!name'] + '#' + Q['!random'].counter++;
};

QUID = function ()
{
	var base = Q['!random'].base;
	var shift = Q['!random'].shift;
	var seed = Number(Q['!random'].seed++).toString(16);
	
	return (base + seed + shift).substring(0, 32);
};

//=============================================================================
//----- IMPORT SERVICE: scripts, modules, threads, docs, resources ------------
//=============================================================================

QDefine = function (info)
{
	var M = Q['!modules'], T = Q['!threads'];
	
	var module = {
		define: function () {
			self.define = {};
			Q[info.name] = self.define;
			M[info.name] = {
				name: info.name,
				owner: Q['!name']
			};
		}
	};
	
	var thread = {
		self: function () {
			T[info.name] = {
				name: info.name,
				owner: info.name
			};
			
			Q[info.name] = {
				onmessage: Q['!utils']['thread/handler'],
				postMessage: function (data) {this.onmessage({data: data});}
			};
		},
		parent: function () {
			var worker = {
				onmessage: function (event) 
				{
					var name = event.data;
					
					Q['!threads'][name] = {name: name, owner: name, parent: true};
					Q[name] = this;
					worker.onmessage = function (event)
					{
						if (Q['!isWork']) Q['!utils']['thread/handler'].call(this, event);
					}
				},
				postMessage: function (data) 
				{
					if (Q['!isWork']) self.postMessage(data);
				}
			};
			self.onmessage = function (event) 
			{
				worker.onmessage(event);
			};
		}
	};
	
	if ( info.is == 'thread' )
	{
		Q['!name'] = info.name;
		
		thread.self();
		thread.parent();
		
		if ( Q['!isWork'] ) self.postMessage(Q['!name']);
	}
	
	if ( info.is == 'module' )
	{
		module.define();
	}
	
	return;
}


QThread = function ( url )
{
	var base = location.href.substring(0, location.href.lastIndexOf('/') + 1);
	
	if ( Q['!cfg'].loading.thread == -1 ) {return;}
	Q['!cfg'].loading.thread++;
	
	function load ()
	{
		if ( Q['!cfg'].loading.plain )
		{
			setTimeout(load, 0);
			return;
		}
		
		if ( self.Worker )
		{
			var worker = new Worker(base + url);
			
			worker.onmessage = function (event)
			{
				var name = event.data;
				
				Q['!threads'][name] = {name: name, owner: name, child: true};
				Q[event.data] = worker;
				worker.onmessage = Q['!utils']['thread/handler'];
			};
			worker.postMessage(Q['!name']);
			
			Q['!cfg'].loading.thread--;
		}
		else
		{
			//TODO delegate to main
			Q['!cfg'].loading.thread--;
		}
	}
	
	setTimeout(load, 0);
	return;
};

QModule = function ( url )
{
	var base = location.href.substring(0, location.href.lastIndexOf('/') + 1);
	
	if ( Q['!cfg'].loading.module == -1 ) {return;}
	Q['!cfg'].loading.module++;
	
	function load ()
	{
		if ( Q['!cfg'].loading.plain )
		{
			setTimeout(load, 0);
			return;
		}
		
		if ( Q['!isWork'] )
		{
			importScripts( base + url );
			Q['!cfg'].loading.module--;
			return;
		}
		else
		{
			var script = document.createElement( 'script' );
			
			script.type = 'text/javascript';
			script.src = base + url;
			script.async = true;
			
			script.onload = function () {Q['!cfg'].loading.module--};
			script.onerror = function () {Q['!cfg'].loading.module--};
			
			document.head.appendChild( script );
		}
	};
	
	setTimeout(load, 0);
	return;
};

QPlain = function ( url )
{
	var base = location.href.substring(0, location.href.lastIndexOf('/') + 1);
	
	if ( Q['!cfg'].loading.plain == -1 ) {return;}
	Q['!cfg'].loading.plain++;
	
	if ( Q['!isWork'] )
	{
		importScripts( base + url );
		Q['!cfg'].loading.plain--;
		return;
	}
	else
	{
		var script = document.createElement( 'script' );
		
		script.type = 'text/javascript';
		script.src = base + url;
		script.async = true;
		
		script.onload = function () {Q['!cfg'].loading.plain--};
		script.onerror = function () {Q['!cfg'].loading.plain--};
		
		document.head.appendChild( script );
	}
	
	return;
};


//=============================================================================
//----- ASYNC FUNCTION SERVICE: root, call, back ------------------------------
//=============================================================================

QRoot = {
	'!prev': null,
	'!func': null,
	
	group: {'#name': null, '#size': 0, '##name': null, '##size': 0},
	arg: null, res: null, sub: null, ret: null
};


QCall = function ( cur, group, size, f, arg )
{
	var next = {
		'!prev': cur,
		'!func': f,
		
		group: {
			'#name': '#',
			'#size': 0,
			'##name': group,
			'##size': 0,
		},
		
		arg: arg || cur.sub,
		res: null,
		
		sub: null,
		ret: null
	}
	
	if ( !cur.group[group] )
	{
		cur.group[group] = size;
		cur.group['##size'] += size;
	}
	
	cur.sub = null;
	cur.ret = null;
	
	var index = f.lastIndexOf('/');
	var n = f.substring(0, index);
	var m = f.substring(index + 1);
	
	if ( Q[n] )
	{
		Q[n][m].call(Q[n], next);
	}
	else
	{
		QProcess(function ( ttl ) 
		{
			if ( !ttl ) {return;}
			if ( !Q[n] ) {return;}
			
			Q[n][m].call(Q[n], next);
			return true;
		});
	}
	return;
};

QBack = function ( cur, res )
{
	var prev = cur['!prev'];
	var f = prev['!func'];
	
	prev.group['#name'] = cur.group['##name'];
	prev.group['#size'] = --prev.group[cur.group['##name']];
	prev.group['##size']--;
	
	prev.sub = null;
	prev.ret = res || cur.res;
	
	cur['!prev'] = null;
	cur['!func'] = null;
	cur['group'] = null;
	cur['arg'] = null;
	cur['res'] = null;
	
	if ( !f ) {return;}
	
	var index = f.lastIndexOf('/');
	var n = f.substring(0, index);
	var m = f.substring(index + 1);
	
	if ( Q[n] )
	{
		Q[n][m].call(Q[n], prev);
	}
	else
	{
		QProcess(function ( ttl ) 
		{
			if ( !ttl ) {return;}
			if ( !Q[n] ) {return;}
			
			Q[n][m].call(Q[n], prev);
			return true;
		});
	}
	return;
};


//=============================================================================
//----- BASIC MESSAGE SERVICE: point, dispatch, process -----------------------
//=============================================================================

QPoint = function ( name, f )
{
	if ( name[0] != '.' ) {console.error('[METHOD] Point shoild start with "." (thread : %s) (point : %s)', Q['!name'], name)}
	
	Q[name] = f;
	return;
};

QDispatch = function ( thread, point, data )
{
	var frame = {
		tSend: Q['!name'],
		tDest: thread,
		point: point,
		data: data,
		ttl: Q['!cfg'].timeout.dispatch,
	};
	
	if ( Q[thread] )
	{
		Q[thread].postMessage(frame);
	}
	else
	{
		Q['!queue'].dispatch.push(frame);
	}
	return;
};

QProcess = function ( f, ttl )
{
	var frame = {
		f: f,
		ttl: ttl || Q['!cfg'].timeout.dispatch
	};
	
	Q['!queue'].process.push(frame);
	return;
};


//=============================================================================
//----- INITIALIZATION --------------------------------------------------------
//=============================================================================


Q['!utils']['field/owner'] = function (name, is)
{
	var type = '+', str = '$_!', res = '--!', suff = name[0], post = name[name.length - 1];
	
	if ( str.indexOf(suff) >= 0 ) {type = res[str.indexOf(suff)];}
	if ( str.indexOf(post) >= 0 ) {type = res[str.indexOf(post)];}
	
	return is ? type == is : type;
};


Q['!utils']['handler/tick/threads'] = function ( data )
{
	var T = Q['!threads'], t = data.threads;
	
	for ( var i = 0, ni = t.length; i < ni; ++i )
	{
		if ( Q[t[i].name] ) {continue;}
		
		Q[t[i].name] = this;
		T[t[i].name] = {
			name: t[i].name,
			owner: t[i].owner
		};
	}
	
	return;
};

Q['!utils']['handler/tick/modules'] = function ( data )
{
	var M = Q['!modules'], m = data.modules, f;
	
	for ( var i = 0, ni = m.length; i < ni; ++i )
	{
		if ( Q[m[i].name] ) {continue;}
		
		Q[m[i].name] = {};
		M[m[i].name] = {
			name: m[i].name,
			owner: m[i].owner
		};
		
		f = m[i].fields;
		
		for ( var j = 0, nj = f.length; j < nj; ++j )
		{
			Q[m[i].name][f[j]] = Q['!utils']['handler/field'];
		}
	}
	
	return;
};

Q['!utils']['handler/field'] = function ( QBox )
{
	var id = QID();
	var f = QBox['!func'];
	var info = Q['!modules'][f.substring(0, f.lastIndexOf('/'))];
	
	if ( QBox.group['#name'] == '#' )
	{
		if ( QBox['!prev']['!func'] ) {Q['!tmp'][id] = QBox;}
		
		var frame = {
			call: true,
			tSend: Q['!name'],
			tDest: info.owner,
			ttl: Q['!cfg'].timeout.dispatch,
			
			id: id, arg: QBox.arg, fcall: QBox['!func'], fback: QBox['!prev']['!func']
		};
	}
	else
	{
		var frame = {
			back: true,
			tSend: Q['!name'],
			tDest: info.owner,
			ttl: Q['!cfg'].timeout.dispatch,
			
			id: QBox['!id'], res: QBox.ret
		};
	}
	
	Q[info.owner].postMessage(frame);
	return;
};

Q['!utils']['handler/call'] = function ( frame )
{
	var QBox = {
		'!id': frame.id,
		'!prev': null,
		'!func': frame.fback,
		
		group: {'#name': null, '#size': 0, '##name': null, '##size': 0},
		arg: null, res: null, sub: null, ret: null
	};
	
	QCall( QBox, '#qwerty', 1, frame.fcall, frame.arg );
	return;
};

Q['!utils']['handler/back'] = function ( frame )
{
	var QBox = Q['!tmp'][frame.id];
	delete Q['!tmp'][frame.id];
	
	QBack( QBox, frame.res );
	return;
};

Q['!utils']['thread/handler'] = function ( event )
{
	var data = event.data;
	
	if ( data.tDest != Q['!name'] )
	{
		if ( Q[data.tDest] )
		{
			Q[data.tDest].postMessage(data);
		}
		else
		{
			data.ttl = Q['!cfg'].timeout.dispatch;
			Q['!queue'].dispatch.push(data);
		}
		
		return;
	}
	
	if ( data.tick )
	{
		Q['!utils']['handler/tick/threads'].call(this, data);
		Q['!utils']['handler/tick/modules'].call(this, data);
		return;
	}
	
	if ( data.call )
	{
		Q['!utils']['handler/call'].call(this, data);
		return;
	}
	
	if ( data.back )
	{
		Q['!utils']['handler/back'].call(this, data);
		return;
	}
	
	if ( Q[data.point] )
	{
		Q[data.point].call(this, data);
	}
	else
	{
		console.error('[HANDLER] Point not defined (thread : %s) (point : %s)', data.tDest, data.point);
	}
	return;
}


//[TICK]опрос
setInterval(function () 
{
	var T = Q['!threads'], M = Q['!modules'], F = Q['!cfg'].loading;
	var threads = [], modules = [];
	
	if ( F.module || F.plain || F.thread ) {return;}
	
	for ( var i in T )
	{
		threads.push({
			name: T[i].name,
			owner: T[i].owner,
		});
	}
	
	for ( var i in M )
	{
		modules.push({
			name: M[i].name,
			owner: M[i].owner,
			fields: []
		});
		
		for ( var j in Q[i] )
		{
			if ( Q['!utils']['field/owner'](j) == '+' )
			{
				modules[modules.length - 1].fields.push(j);
			}
		}
	}
	
	for ( var i in T )
	{
		if ( T[i].name == Q['!name'] ) {continue;}
		if ( !T[i].child && !T[i].parent ) {continue;}
		
		Q[T[i].name].postMessage({
			tick: true,
			tSend: Q['!name'],
			tDest: T[i].name,
			threads: threads,
			modules: modules,
		});
	}
	
	return;
}, Q['!cfg'].tick);




//[DISPATCH LOOP]очередь ожидающих отправки
//tSend, tDest, point, data, ttl
setInterval(function () 
{
	var L = Q['!queue'].dispatch;
	
	for ( var i = 0, ni = L.length; i < ni; ++i )
	{
		var item = L[i];
		
		if ( Q[item.tDest] === undefined )
		{
			if ( --item.ttl == 0 )
			{
				delete L[i];
				console.error('[DISPATCH] Timeout (send : %s) (dest : %s) (point : %s)', item.tSend, item.tDest, item.point);
			}
			continue;
		}
		
		delete L[i];
		Q[item.tDest].postMessage(item);
	}
	
	Q['!queue'].dispatch = [];
	for ( var i = 0, ni = L.length; i < ni; ++i )
	{
		if ( L[i] ) Q['!queue'].dispatch.push(L[i]);
	}
	
	return;
}, 0);

//[PROCESS]очередь ожидающих обработки
//f, ttl
setInterval(function ()
{
	var L = Q['!queue'].process;
	
	for ( var i = 0, ni = L.length; i < ni; ++i )
	{
		var data = L[i];
		
		if ( !data.f.call(null, data.ttl) )
		{
			if ( --data.ttl == 0 )
			{
				delete L[i];
				data.f.call(null, data.ttl);
				console.error('[PROCESS] Timeout (thread : %s)', Q['!name']);
			}
			continue;
		}
		
		delete L[i];
	}
	
	Q['!queue'].process = [];
	for ( var i = 0, ni = L.length; i < ni; ++i )
	{
		if ( L[i] ) Q['!queue'].process.push(L[i]);
	}
	
	return;
}, 0);

