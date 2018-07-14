## Введение
Сервис загрузки произвольных скриптов. Представлен QModule(url).

## Загрузка
* Произвольные скрипты можно подключить (QModule) во frame/worker, и больше никуда

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
		
		QModule('./jquery1.js');
		QModule('./jquery2.js');
	</script>
</html>
```

```javascript
importScripts('QCore.js');
QDefine({
	is: 'worker',
	name: '/My/Worker/X'
});

QModule('./jquery1.js');
QModule('./jquery2.js');
```
