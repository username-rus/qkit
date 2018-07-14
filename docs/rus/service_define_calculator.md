## Введение
Сервис определения и загрузки calculator. Представлен QDefine(info), QModule(url).

## Определение
* Определение calculator производится в `отдельном файле`, либо в `собственном файле` frame/worker
* Допускается определение от одного до нескольких различных calculator на один файл.
* Имена calculator должны начинатся с буквы в формате [UpperCamelCase] с разделением "/" на логические составляющие
* Имена calculator локальны, и должно быть уникальными в пределах одного ГКИ
* Публичные методы и поля должны начинатся с буквы в формате [lowerCamelCase] без разделения
* Приватные методы и поля должны начинатся с, либо оканчиватся на "$ _", в формате [lowerCamelCase] без разделения

```javascript
//Отдельный файл
QDefine({
	is: 'calculator',
	name: 'My/Calculator/X'
});

define.fPublicX = function (...) {...}
define.dPublicX = 123;
define.fPrivateX_ = function (...) {...}
define.dPrivateX_ = {x: 123}

QDefine({
	is: 'calculator',
	name: 'My/Calculator/Y'
});

define.fPublicY = function (...) {...}
define.dPublicY = 123;
define.fPrivateY_ = function (...) {...}
define.dPrivateY_ = {y: 123}
```

```javascript
//Собственный файл worker
importScripts('QCore.js');
QDefine({
	is: 'worker',
	name: '/My/Worker/X'
});

QDefine({
	is: 'calculator',
	name: 'My/Calculator/X'
});

define.fPublicX = function (...) {...}
define.dPublicX = 123;
define.fPrivateX_ = function (...) {...}
define.dPrivateX_ = {x: 123}
```

```html
//Собственный файл frame
<!DOCTYPE html>
<html>
<head>
	<title> Frame </title>
	<script type='text/javascript' src='QCore.js'></script>
</head>
	<body>
		<!-- ... -->
	</body>
	<script>
		QDefine({
			is: 'frame',
			name: '/My/Frame/X'
		});
		
		QDefine({
			is: 'calculator',
			name: 'My/Calculator/X'
		});
		
		define.fPublicX = function (...) {...}
		define.dPublicX = 123;
		define.fPrivateX_ = function (...) {...}
		define.dPrivateX_ = {x: 123}
	</script>
</html>
```


## Загрузка
* Calculator можно подключить (QModule) во frame/worker, и больше никуда

```html
<!DOCTYPE html>
<html>
<head>
	<title> Frame </title>
	<script type='text/javascript' src='QCore.js'></script>
</head>
	<body>
		<!-- ... -->
	</body>
	<script>
		QDefine({
			is: 'frame',
			name: '/My/Frame/X'
		});
		
		QModule('./calculator1.js');
		QModule('./calculator2.js');
	</script>
</html>
```

```javascript
importScripts('QCore.js');
QDefine({
	is: 'worker',
	name: '/My/Worker/X'
});

QModule('./calculator1.js');
QModule('./calculator2.js');
```
