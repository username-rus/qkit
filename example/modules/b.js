console.log('%c[LOADED] %c[Name: %s] [Thread: %s]', 'color:green', 'color:black', 'Test/B', Q['name']);
QDefine({
	is: 'commandant',
	name: 'Test/B'
});

define.f1 = function ( QBox )
{
	switch ( QBox.from )
	{
		case '#':
			console.log('%c[CALL] %c[Arg: %s] [Method: %s] [Thread: %s]', 'color:blue', 'color:black', QBox.arg, 'Test/B/f1', Q['name']);
			QBack(QBox, null);
			break;
	}
};

define.f2 = function ( QBox )
{
	switch ( QBox.from )
	{
		case '#':
			console.log('%c[CALL] %c[Arg: %s] [Method: %s] [Thread: %s]', 'color:blue', 'color:black', QBox.arg, 'Test/B/f2', Q['name']);
			QCall( QBox, 'Test/C/f2', QBox.arg );
			break;
			
		case '#Test/C/f2':
			console.log('%c[BACK] %c[Ret: %s] [Method: %s] [Thread: %s]', 'color:red', 'color:black', QBox.ret, 'Test/B/f2', Q['name']);
			QBack(QBox, QBox.ret);
			break;
	}
};



