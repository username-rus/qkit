## Введение
Сервис рабочего набора. Представлен QList(list).

## Рабочий набор
Позволяет получить наборы вычислителей (calculator) необходимых в данный момент, с сокращенным именем.

```javascript
var X = QList('My/Example1');
var Y = QList(['My/Example2', 'My/Example3']);

var a = X.exampleMethod();
var b = Y.Example2.exampleMethod();
var c = Y.Example3.exampleMethod();
```
