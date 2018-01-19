console.log('%c[LOADED] %c[Name: %s] [Thread: %s]', 'color:green', 'color:black', 'Test/B', Q['!name']);
QDefine({
	is: 'module',
	name: 'Test/B'
});

define.f1 = function ( QBox )
{
	switch ( QBox.group['#name'] )
	{
		case '#':
			console.log('%c[CALL] %c[Arg: %s] [Method: %s] [Thread: %s]', 'color:blue', 'color:black', QBox.arg, 'Test/B/f1', Q['!name']);
			QBack(QBox, null);
			break;
	}
};

define.f2 = function ( QBox )
{
	switch ( QBox.group['#name'] )
	{
		case '#':
			console.log('%c[CALL] %c[Arg: %s] [Method: %s] [Thread: %s]', 'color:blue', 'color:black', QBox.arg, 'Test/B/f2', Q['!name']);
			QCall( QBox, '#c', 1, 'Test/C/f2', QBox.arg );
			break;
			
		case '#c':
			console.log('%c[BACK] %c[Ret: %s] [Method: %s] [Thread: %s]', 'color:red', 'color:black', QBox.ret, 'Test/B/f2', Q['!name']);
			QBack(QBox, QBox.ret);
			break;
	}
};



