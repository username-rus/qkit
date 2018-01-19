## Введение
Данный фреймворк предоставляет собой инструментарий и набор соглашений, для организации полностью асинхронной модели вычисления. Соответствующая функциональность представлена минимальным набором глобальных функций, собранных в условные группы. Данные группы названы сервисами. Каждый сервис предоставляет определенный класс функциональности. Ниже представлен перечень со ссылками на подробную документацию.

## Состояние разработки
На данный момент проект находится в самом начале разработки, мажорная версия 0.Х.Х. Происходит поиск общего дизайна и вектора развития. Возможны баги и неожиданные фичи. Обратная совместимость релизов мажорной версии 0.Х.Х не гарантируется. Смотрите документацию к конкретной версии. Состояние документации к данному релизу не соответствует пожеланиям автора. Документация будет улучшена и дополнена к одному из следующих минорных релизов.

## Текущее направление разработки
На данный момент ведется работа по следующим направлениям
* балансировка ядра (производительность/простота)
* разработка сервиса и соглашений регистрации и обработки исключений
* разработка сервиса и соглашений для тестирования кода
* доведение документации до приемлемого состояния
* развитие инструментария QTool, добавление серверной стороны
* выработка специфичных шаблонов проектирования, проверка текущей функциональности на универсальность

### Текущие соглашения, Q и QTool
Описание глобального объекта Q, утилиты QTool и текущих соглашений [[подробнее]](./service_agreement.md)

### Сервис идентификаторов
Представлен глобальными методами QID, QUID [[подробнее]](./service_id.md)

### Сервис определения и загрузки потоков
Представлен QDefine, QThread [[подробнее]](./service_thread.md)

### Сервис определения и загрузки модулей
Представлен QDefine, QModule [[подробнее]](./service_module.md)

### Сервис определения и загрузки чистого js
Представлен QPlain [[подробнее]](./service_plain.md)

### Сервис базового асинхронного взаимодействия
Представлен QPoint, QDispatch, QProcess [[подробнее]](./service_base_async.md)

### Сервис асинхронных вызовов функций
Представлен QCall, QBack, QRoot [[подробнее]](./service_asunc_function.md)
