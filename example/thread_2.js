console.log('%c[LOADED] %c[Name: %s]', 'color:green', 'color:black', '/Worker/2');
importScripts('../src/QCore.js');
QDefine({
	is: 'worker',
	name: '/Worker/2'
});

QModule( 'modules/c.js' );
QModule( 'points/z.js' );




//var x = Q['list'][1];
	
//x.ptr.postMessage(321);

