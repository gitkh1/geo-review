# Приложение ГеоОтзыв

Приложение, которое отображает Яндекс-карту на всю страницу.
На карте можно выбирать объекты и оставлять отзывы о них.

## Что делает

- Реагирует на клики по карте. При клике на карту открывается балун с формой для отзыва
- После заполнения формы на карту добавляется плейсмарк по тем координатам
- Отзывы поблизости группируются в одну метку с количеством меток
- После нажатия на плейсмарк открываться форма для составления нового отзыва
- При нажатии на сгруппированный объект открывается карусель отзывов
- При нажатии на адрес в карусели откроется окно с отзывами по данному адресу
- На форме присутствуют все ранее оставленные отзывы
- При перезагрузке страницы, все отзывы и плейсмарки восстанавливаются

## Что реализовано

- API Яндекс-карты
- Добавление отзыва об организации для точки на карте
- Отображение отзывов в балунах
- Группировка отзывов
- Сохранение информации в localStorage

## Как запускать

https://gitkh1.github.io/geo-review/

- `start` - запустить сервер для локальной разработки
- `build` - собрать проект в папку dist
