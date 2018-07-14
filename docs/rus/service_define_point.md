## Введение
Сервис определения и загрузки point. Представлен QDefine(info), QModule(url).

## Определение
* Определение point производится в `отдельном файле`, либо в `собственном файле` frame/worker
* Допускается определение от одного до нескольких различных point на один файл.
* Имена point должны начинатся с буквы в формате [lowerCamelCase] без разделения
* Имена point глобальные, производные, должно быть уникальными в пределах одного ГКИ
* Публичный метод только один - main
* Публичных полей быть не должно
* Приватные методы и поля должны начинатся с, либо оканчиватся на "$ _", в формате [lowerCamelCase] без разделения

```javascript
//Отдельный файл
QDefine({
	is: 'point',
	name: 'myPointX'
});

define.main = function (...) {...}
define.fPrivateX_ = function (...) {...}
define.dPrivateX_ = {x: 123}

QDefine({
	is: 'point',
	name: 'myPointY'
});

define.main = function (...) {...}
define.fPrivateX_ = function (...) {...}
define.dPrivateX_ = {x: 123}
```

```javascript
//Собственный файл worker
importScripts('QCore.js');
QDefine({
	is: 'worker',
	name: '/My/Worker/X'
});

QDefine({
	is: 'point',
	name: 'myPointX'
});

define.main = function (...) {...}
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
			is: 'point',
			name: 'myPointX'
		});
		
		define.main = function (...) {...}
		define.fPrivateX_ = function (...) {...}
		define.dPrivateX_ = {x: 123}
	</script>
</html>
```


## Загрузка
* Point можно подключить (QModule) во frame/worker, и больше никуда
* Одни и те же point можно подключать в различные ГКИ, полное имя point будет производным от имени ГКИ

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
		
		QModule('./point1.js');
		QModule('./point2.js');
	</script>
</html>
```

```javascript
importScripts('QCore.js');
QDefine({
	is: 'worker',
	name: '/My/Worker/X'
});

QModule('./point1.js');
QModule('./point2.js');
```
