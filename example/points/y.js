console.log('%c[LOADED] %c[Name: %s] [Thread: %s]', 'color:green', 'color:black', 'y', Q['name']);
QDefine({
	is: 'point',
	name: 'y'
});

define.main = function ( arg )
{
	console.log('%c[POINT] %c[Arg: %s] [Thread: %s]', 'color:blue', 'color:black', arg, Q['name']);
};






