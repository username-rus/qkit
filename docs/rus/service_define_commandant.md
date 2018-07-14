## Введение
Сервис определения и загрузки commandant. Представлен QDefine(info), QModule(url).

## Определение
* Определение commandant производится в `отдельном файле`, либо в `собственном файле` frame/worker
* Допускается определение от одного до нескольких различных commandant на один файл.
* Имена commandant должны начинатся с буквы в формате [UpperCamelCase] с разделением "/" на логические составляющие
* Имена commandant глобальны, и должно быть уникальными для проекта
* Публичные методы должны начинатся с буквы в формате [lowerCamelCase] без разделения
* Публичные поля не допускаются
* Приватные методы и поля должны начинатся с, либо оканчиватся на "$ _", в формате [lowerCamelCase] без разделения

```javascript
//Отдельный файл
QDefine({
	is: 'commandant',
	name: 'My/Сommandant/X'
});

define.fPublicX = function (...) {...}
define.fPrivateX_ = function (...) {...}
define.dPrivateX_ = {x: 123}

QDefine({
	is: 'commandant',
	name: 'My/Сommandant/Y'
});

define.fPublicY = function (...) {...}
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
	is: 'commandant',
	name: 'My/Сommandant/X'
});

define.fPublicX = function (...) {...}
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
			is: 'commandant',
			name: 'My/Сommandant/X'
		});
		
		define.fPublicX = function (...) {...}
		define.fPrivateX_ = function (...) {...}
		define.dPrivateX_ = {x: 123}
	</script>
</html>
```


## Загрузка
* Сommandant можно подключить (QModule) во frame/worker, и больше никуда

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
		
		QModule('./commandant1.js');
		QModule('./commandant2.js');
	</script>
</html>
```

```javascript
importScripts('QCore.js');
QDefine({
	is: 'worker',
	name: '/My/Worker/X'
});

QModule('./commandant1.js');
QModule('./commandant2.js');
```
