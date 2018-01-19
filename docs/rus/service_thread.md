## Введение
Сервис определения и загрузки потоков, представлен QDefine, QThread. Потоки реализованы по средствам WebWorker. Основной (GUI thread) так же считается равноценным с воркерами потоком, только с расширенным окружением. В файл потока можно подключать все: другие потоки QThread(url), модули QModule(url), чистый js QPlain(url), url в данном случае должен быть абсолютным, либо относительным от файла потока. Можно подключать один воркер в другой, но эта возможность должна `поддерживаться браузером`, и для большенства задачь не имеет особого смысла.

## Определение потока
* Имя потока должно быть уникальным
* Имя потока должно начинатся с "/" первым словом должно идти имя проекта к которому принадлежит поток
* Имя потока в формате [UpperCamelCase] с разделением "/" на логические составляющие
* Файл потока может содержать определение модулей
* Файл потока может содержать определение "чистого" js (не модулей)
* Файл потока может содержать подключение модулей
* Файл потока может содержать подключение потоков
* Файл потока может содержать подключение "чистого" js (не модулей, например jquery, underscore, и т.д.)
* Порядок следования: 1. подключение фреймворка, 2. определение текущего потока, 3. дальнейший порядок не важен

### Для WebWorker
```javascript
//подключение фреймворка
importScripts('QCore.js');

//определение потока
QDefine({
	is: 'thread',
	name: '/My/Thread/1'
});

//определение чистого js внутри файла потока
var someVar = 1;
function someFunction () {return 1};
function someDataType ()
{
	this.a = 1;
	this.b = 2;
	return this;
}
someDataType.prototype.f1 = function () {...};
someDataType.prototype.f2 = function () {...};

//определение модуля внутри файла потока
QDefine({
	is: 'module',
	name: 'My/ErrorMaker'
});
define.doSomeError = function (QBox) {...};
define.$errorGenerator = function (seed) {...};
define._errorPool = [...];

//подключение дополнительных потоков, модулей, чистого js
QThread('url/from/current/thread');
QModule('url/from/current/thread');
QPlain('url/from/current/thread');
```

### Для GUI thread (можно вынести в подключаемый js)
```html
<html>
	<head>
		<title> Example </title>
		<!-- подключение фреймворка -->
		<script type='text/javascript' src='QCore.js'></script>
		<!-- то что в <script> ниже можно вынести в отдельный js и подключить тут -->
	</head>
	<body>
		
	</body>
	<script>
		//определение потока
		QDefine({
			is: 'thread',
			name: '/My/Thread/1'
		});
		
		//определение чистого js внутри файла потока
		var someVar = 1;
		function someFunction () {return 1};
		function someDataType ()
		{
			this.a = 1;
			this.b = 2;
			return this;
		}
		someDataType.prototype.f1 = function () {...};
		someDataType.prototype.f2 = function () {...};
		
		//определение модуля в нутри файла потока
		QDefine({
			is: 'module',
			name: 'My/ErrorMaker'
		});
		define.doSomeError = function (QBox) {...};
		define.$errorGenerator = function (seed) {...};
		define._errorPool = [...];
		
		//подключение дополнительных потоков, модулей, чистого js
		QThread('url/from/current/thread');
		QModule('url/from/current/thread');
		QPlain('url/from/current/thread');
	</script>
</html>
```
