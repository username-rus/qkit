## Введение
Сервис определения и загрузки worker. Представлен QDefine(info), QWorker(url).

## Определение
* Worker представляет собой глобальный контекст исполнения dedicated worker
* Определение worker производится в `собственном файле`
* Определение worker несколько раз на файл не имеет смысла
* Имена worker должны начинатся с "/" в формате [UpperCamelCase] с разделением "/" на логические составляющие
* Имена worker глобальны, и должно быть уникальными для проекта

```javascript
importScripts('QCore.js');
QDefine({
	is: 'worker',
	name: '/My/Worker/X'
});
```

## Загрузка
* Worker можно подключить (QWorker) во frame/worker, и больше никуда


```javascript
importScripts('QCore.js');
QDefine({
	is: 'worker',
	name: '/My/Worker/X'
});

QWorker('./Worker/1.js');
QWorker('./Worker/2.js');
```

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
		
		QWorker('./Worker/1.js');
		QWorker('./Worker/2.js');
	</script>
</html>
```
