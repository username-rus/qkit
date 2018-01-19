## Введение
Сервис определения и загрузки чистого js. Представляет из себя простую загрузку js файлов проектов, выполненных вне данного фреймворка. Такие как например jquery, underscore, angular, и другие. То есть готовые, известные (или нет) и часто синхронные решения тех или иных задачь, которые можно использовать в общей асинхронной модели вычисления. Фреймворк гарантирует что модули и потоки будут загружены после загрузки чистого js.

## О чем речь?
Данное решение, для асинхронной модели вычисления, сильно проигрывает по производительности естественной синхронной модели, особенно при вызове функций из другого потока. Потому данный фреймворк должен использоватся только для организации общего управления вычислениями вашего проекта. Вся же "тяжелая" работа должна осуществлятся через синхронную функциональность вызываемую из асинхронного "потока исполнения". Для этого и должно использоватся "чистый js", либо приватные синхронные методы модулей. Учтите что чистый js необходимо подключать в каждый файл потока где тебуется необходимая функциональность (например underscore).

## Пример
```javascript
function StringProcessor (init)
{
	this.someField1 = init;
	this.someField2 = 'someValue';
	
	return this;
}

StringProcessor.someStaticMethod1 = function (inst, x) {...};
StringProcessor.someStaticMethod2 = function (inst, x) {...};

StringProcessor.prototype.someInstanceMethod1 = function (x) {...};
StringProcessor.prototype.someInstanceMethod2 = function (x) {...};
```

```javascript
var StringProcessor = {
	new: function (init) 
	{
		return {
			someField1: init,
			someField2: 'someValue'
		};
	},
	free: function (inst) 
	{
		...
	}
	isType: function (test)
	{
		return 'someField1' in test && 'someField2' in test;
	}
};

StringProcessor.someMethod1 = function (inst, x) {...};
StringProcessor.someMethod2 = function (inst, x) {...};
StringProcessor.someMethod3 = function (inst, x) {...};
StringProcessor.someMethod4 = function (inst, x) {...};
```
