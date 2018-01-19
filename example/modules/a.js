console.log('%c[LOADED] %c[Name: %s] [Thread: %s]', 'color:green', 'color:black', 'Test/A', Q['!name']);
QDefine({
	is: 'module',
	name: 'Test/A'
});

define.f1 = function ( QBox )
{
	switch ( QBox.group['#name'] )
	{
		case '#':
			console.log('%c[CALL] %c[Arg: %s] [Method: %s] [Thread: %s]', 'color:blue', 'color:black', QBox.arg, 'Test/A/f1', Q['!name']);
			QBack(QBox, null);
			break;
	}
};

define.f2 = function ( QBox )
{
	switch ( QBox.group['#name'] )
	{
		case '#':
			console.log('%c[CALL] %c[Arg: %s] [Method: %s] [Thread: %s]', 'color:blue', 'color:black', QBox.arg, 'Test/A/f2', Q['!name']);
			QCall( QBox, '#b', 1, 'Test/B/f2', QBox.arg );
			break
			
		case '#b':
			console.log('%c[BACK] %c[Ret: %s] [Method: %s] [Thread: %s]', 'color:red', 'color:black', QBox.ret, 'Test/A/f2', Q['!name']);
			QBack(QBox, QBox.ret);
			break;
	}
};




