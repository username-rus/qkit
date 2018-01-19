console.log('%c[LOADED] %c[Name: %s] [Thread: %s]', 'color:green', 'color:black', 'Test/C', Q['!name']);
QDefine({
	is: 'module',
	name: 'Test/C'
});

define.f2 = function ( QBox )
{
	switch ( QBox.group['#name'] )
	{
		case '#':
			console.log('%c[CALL] %c[Arg: %s] [Method: %s] [Thread: %s]', 'color:blue', 'color:black', QBox.arg, 'Test/C/f2', Q['!name']);
			QBack(QBox, 'C');
			break;
	}
};





