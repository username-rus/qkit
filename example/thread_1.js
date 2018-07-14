console.log('%c[LOADED] %c[Name: %s]', 'color:green', 'color:black', '/Worker/1');
importScripts('../src/QCore.js');
QDefine({
	is: 'worker',
	name: '/Worker/1',
});

QModule( 'modules/b.js' );
QModule( 'points/y.js' );

//QWorker('thread_2.js');

/*
console.log(123)
self.addEventListener('message', function (e) {console.log(e)});
self.postMessage(2);
*/

//var x = Q['list'][1];
	
//x.ptr.postMessage(321);
