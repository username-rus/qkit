## Введение
Сервис определения и загрузки frame. Представлен QDefine(info), QFrame(url, parent).

## Определение
* Frame представляет собой глобальный контекст исполнения iframe или gui thread
* Index (gui thread) это обычный frame и так же оформляется
* Определение frame производится в `собственном файле`
* Определение frame несколько раз на файл не имеет смысла
* Имена frame должны начинатся с "/" в формате [UpperCamelCase] с разделением "/" на логические составляющие
* Имена frame глобальны, и должно быть уникальными для проекта

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
	</script>
</html>
```

## Загрузка
* Один frame можно подключить (QFrame) в другой frame, и больше никуда

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
		
		QFrame('./Frame/1.js');
		QFrame('./Frame/2.js');
	</script>
</html>
```
