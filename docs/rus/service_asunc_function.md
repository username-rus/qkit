## Введение
Сервис асинхронных вызовов функций, представлен QCall, QBack, QRoot. Позволяет вызывать публичные функции модулей из любого потока. Данный сервис является главной особенностью этого фреймворка, и наиболее обширной частью для документирования. Основной принцип работы - это имитация стека вызовов средствами javascript + отложенный возврат из функции (возврат по команде) + специальное оформление самой функции. В общем то это промайсы, только, эмм, в "ширину" а не "длину". Промайсы, сохраняющие принципы работы обычных синхронных функций. 

## Проблемы и ограничения
В силу пары особенностей, присущих данной версии, можно схватить исключение слишком глубокой рекурсии. Это происходит при полностью синхронных последовательных действиях, например при переборе массива в несколько тысячь элементов. Данная проблема будет полностью устранена в будующей версии, за счет небольшой потери в производительности. Так же пропадет необходимость указывать размер рабочей группы, и необходимость полного завершения рабочей группы, перед повторным запуском.

### QCall
* Служит для вызова асинхронной функции (публичный/приватный метод модуля)
* Асинхронные функции должны определятся `только` в составе модуля
* Синхронный (естественный) контекст исполнения функции `пропадает` при `синхронном возврате` из функции
* Использует базовую систему взаимодействия, можно делать вызовы не дожидаясь загрузки чего либо
* Можно вызывать любую публичную функцию модуля, в каком бы потоке он не находился (но учтите производительность)
* Можно вызывать любую приватную асинхронную функцию модуля, в пределах потока в котором, определен либо подключен модуль
* Поддержка произвольного числа одновременных (до синхронного возврата) подвызовов
* Подвызовы снабжаются именем рабочей группы, и размером рабочей группы == числу одновременных (до синхронного возврата) подвызовов данной группы
* При запуске (до синхронного возврата) рабочей группы размером > 1 не допускается повторный запуск, до полного завершения данной группы
* Подвызовы исполняются паралельно (если используется реальная асинхронная функциональность), иначе в порядке следования
* Поддержка рекурсии, в этом случае размер размер рабочей группы должен быть == 1
* Параметры (cur, group, size, f, arg)
  * cur - текущая вершина стека (QBox)
  * group - имя рабочей группы вызываемой подфункции, возвраты подвызовов отслеживаются по этому имени
  * size - размер рабочей группы вызываемой подфункции == числу одновременных подвызовов (до синхронного возврата, смотри пример)
  * f - имя вызываемой подфункции (в составе модуля)
  * arg - аргументы вызываемой подфункции

### QBack
* Служит для возврата `по команде` из текущей асинхронной функции
* Синхронный (естественный) возврат из функции игнорируется
* Параметры (cur, res)
  * cur - текущая вершина стека (QBox)
  * res - результат работы

### QRoot
* Начало стека (QBox)
* Служит для запуска асинхронной модели (смотри пример ниже)

### QBox
* Текущая вершина стека, и единственный параметр асинхронной функции
* При асинхронных действиях должен сохранятся в замыкании
* Является контекстом исполнения функции, сюда можно записывать то, что необходимо сохранить между подвызовом-возвратом
* Определено 2 служебных поля '!prev', '!func'
* Определено 5 специальных полей
  * group - информация о всех рабочих группах данной функции (имя группы : число подфункций в группе находящихся на исполнении)
    * определено 4 специальных имени групп
    * #name - имя `текущей` группы (# - определяет вызова данной функции, #any_string - определяет возврат из подфункции)
    * #size - число подфункций в `текущей` группе, находящихся на исполнении
    * ##name - имя группы возврата - имя группы, с которым была вызвана данная функция
    * ##size - размер группы возврата - число всех подфункций находящихся в данный момент на исполнении. Предназначено для отслеживания завершения вызовов, имеющих разные группы. При достижении нуля возврата не происходит! Возврат `только` по команде QBack
  * arg - аргументы текущей функции
  * res - результат работы текущей функции, можно указывать тут или последним параметром QBack, предназначено для "накопления результата"
  * sub - аргументы подфункции, можно указывать тут или последним параметром QCall, предназначено для "накопления аргументов"
  * ret - результат работы подфункции

### Асинхронная функция
* Формат оформления функции для возможности асинхронного вызова
* Должна быть `только` в составе модуля
* Все публичные методы модуля должны удовлетворять этому формату
* Вызов приватных методов модуля, удовлетворяющих формату, ограничен потоком расположения модуля.
* Должна иметь только один параметр - QBox
* В теле функции должен быть один switch с метками: # - вызов данной функции, #any_string - возврат из подфункции
* Возврат (return) осуществляется `только` по команде QBack
* Синхронный (естественный) возврат игнорируется
* Синхронный (естественный) контекст исполнения проподает при естественном возврате
* Для сохранения данных до асинхронного возврата (QBack) необходимо использовать QBox.x = 1;
* Текущая вершина стека QBox должна сохранятся в замыкании при асинхронных действиях
* Вызов происходит в контексте модуля, в котором определена данная функция (доступен this)


### Пример
```javascript
//Модуль-обертка вокруг xmlHttpRequest.
QDefine({
	is: 'module',
	name: 'My/Utils/HTTP'
});

define.request = function (QBox)
{
	switch (QBox.group['#name'])
	{
		case '#':
			QBox.http = new XMLHttpRequest();
			this.$open(QBox.http, QBox.arg);
			this.$setRequestHeader(QBox.http, QBox.arg);
			this.$setResponseType(QBox.http, QBox.arg);
			
			QBox.http.onreadystatechange = function () 
			{
				if (QBox.http.readyState == 4) 
				{
					QBack(QBox, QBox.http.response);
				}
			}
			QBox.http.send( QBox.arg.data || null );
			break;
	}
};

define.$open = function ( http, arg )
{
	if ( !arg.method || !arg.url ) {throw 'Error';}
	
	http.open( arg.method, arg.url, true );
};

define.$setRequestHeader = function ( http, arg )
{
	if ( !arg.header ) {return;}
	
	for ( var i in arg.header ) 
	{
		http.setRequestHeader( i, arg.header[i] );
	}
};

define.$setResponseType = function ( http, arg )
{
	if ( !arg.type ) {return;}
	
	http.responseType = arg.type;
};
```

```javascript
//Модуль использующий вышеописанный модуль-обертку
QDefine({
	is: 'module',
	name: 'My/Core/Cocore'
});

define.init = function ( QBox )
{
	switch (QBox.group['#name'])
	{
		case '#':
			QBox.step = [];
			QCall(QBox, '#init_step_1', 2, 'My/Utils/HTTP/request', 
			{
				url: '...',
				method 'POST',
				data: 'server_please_send_list_A'
			});
			QCall(QBox, '#init_step_1', 2, 'My/Utils/HTTP/request', 
			{
				url: '...',
				method 'POST',
				data: 'server_please_send_list_B'
			});
			break;
			
		case '#init_step_1':
			QBox.step.push(QBox.ret);
			
			if ( !QBox.group['#size'] ) 
			{
				this.$initStepProcess(QBox.step[0], 'list');
				this.$initStepProcess(QBox.step[1], 'list');
				
				QCall(QBox, '#init_step_2', 1, 'My/Utils/HTTP/request', 
				{
					url: '...',
					method 'POST',
					data: 'server_please_send_map'
				});
			}
			break;
			
		case '#init_step_2':
			this.$initStepProcess(QBox.ret, 'map');
			
			QBack(QBox, 'init_complite');
			break;
	}
};

define.handler = function ( QBox ) 
{
	...
};

define.$initStepProcess = function (...) {...};
```

```javascript
//Запуск асинхронной модели
QDefine({
	is: 'thread',
	name: '/My/Main'
});

//дожидаться полной загрузки не обязательно
QCall(QRoot, null, 1, 'My/Core/Cocore/init', null);

//можеть быть произвольное количество точек входа в асинхронную модель
document.getElementById('abc').addEventListener('click', function (event)
{
	QCall(QRoot, null, 1, 'My/Core/Cocore/handler', {is: 'click', element: this});
});
```

## Обобщенный пример
```javascript
//Определение потока (не забудте подключить фреймворк)
QDefine({
	is: 'thread',
	name: '/My/Main'
});

//Определение N модулей
QDefine({
	is: 'module',
	name: 'My/SomeModule1'
});
define.someMethod = function ( QBox ) {...};

QDefine({
	is: 'module',
	name: 'My/SomeModule2'
});
define.someMethod = function ( QBox ) {...};

.............................................

QDefine({
	is: 'module',
	name: 'My/SomeModuleN'
});
define.someMethod = function ( QBox ) {...};

//Определение некоего главного модуля
QDefine({
	is: 'module',
	name: 'My/MainModule'
});
define.someInitMethod = function ( QBox ) 
{
	...
};
define.someСomputingMethod = function ( QBox ) 
{
	switch (QBox.group['#name'])
	{
		case '#':
			QCall(QBox, '#comp_step_1', 1, 'My/SomeModule1/someMethod', QBox.arg);
			break;
			
		case '#comp_step_1':
			QBox.step = [];
			QCall(QBox, '#comp_step_2', 3, 'My/SomeModule2/someMethod', QBox.ret[0]);
			QCall(QBox, '#comp_step_2', 3, 'My/SomeModule2/someMethod', QBox.ret[1]);
			QCall(QBox, '#comp_step_2', 3, 'My/SomeModule2/someMethod', QBox.ret[2]);
			break;
			
		case '#comp_step_2':
			QBox.step.push(QBox.ret);
			
			if ( !QBox.group['#size'] ) 
			{
				QBox.res = {list1: [], list2: []};
				
				for (var i = 0, ni = 2; i < ni; ++i)
				{
					QCall(QBox, '#comp_step_3', ni, 'My/SomeModule3/someMethod', QBox.step);
				}
				
				for (var i = 0, ni = 2; i < ni; ++i)
				{
					QCall(QBox, '#comp_step_4', ni, 'My/SomeModule4/someMethod', QBox.step);
				}
			}
			break;
			
		case '#comp_step_3':
			QBox.res.list1.push(QBox.ret);
			
			if ( !QBox.group['##size'] )
			{
				QBack(QBox);
			}
			break;
			
		case '#comp_step_4':
			QBox.res.list2.push(QBox.ret);
			
			if ( !QBox.group['##size'] )
			{
				QBack(QBox);
			}
			break;
	}
};

//точки входа в асинхронную модель
QCall(QRoot, null, 1, 'My/MainModule/someInitMethod', 'some_init_info');

document.getElementById('abc').addEventListener('click', function (event)
{
	QCall(QRoot, null, 1, 'My/MainModule/someСomputingMethod', [1, 2, 3]);
});
```
