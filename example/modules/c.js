console.log('%c[LOADED] %c[Name: %s] [Thread: %s]', 'color:green', 'color:black', 'Test/C', Q['name']);
QDefine({
	is: 'commandant',
	name: 'Test/C'
});

define.f2 = function ( QBox )
{
	switch ( QBox.from )
	{
		case '#':
			console.log('%c[CALL] %c[Arg: %s] [Method: %s] [Thread: %s]', 'color:blue', 'color:black', QBox.arg, 'Test/C/f2', Q['name']);
			var x = a + 1;
			QBack(QBox, 'C');
			break;
	}
};





