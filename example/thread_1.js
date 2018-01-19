console.log('%c[LOADED] %c[Name: %s]', 'color:green', 'color:black', '/Thread/1');
importScripts('../src/QCore.js');
QDefine({
	is: 'thread',
	name: '/Thread/1',
});

QModule( 'modules/b.js' );




