import './map.html';

const mapContainer = document.querySelector('#app');

import ymaps from 'ymaps';

if (!localStorage.getItem('geo')) {
  localStorage.setItem('geo', JSON.stringify([]));
}

function saveGeoToLocal(obj) {
  const geo = getGeoFromLocal();
  geo.push(obj);
  localStorage.setItem('geo', JSON.stringify(geo));
}
function getGeoFromLocal() {
  return JSON.parse(localStorage.getItem('geo'));
}

function getDate() {
  const date = new Date();
  const day = `0${date.getDate()}`.slice(-2);
  const month = `0${date.getMonth() + 1}`.slice(-2);
  return `${day}.${month}.${date.getFullYear()}`;
}

function createCustomBalloon(objects) {
  const reviewTemplate = document.getElementById('reviewTemplate');
  const result = document
    .getElementById('customBalloonTemplate')
    .content.cloneNode(true).firstElementChild;
  const balloon = result.querySelector('.balloon');
  objects.forEach((item) => {
    const review = reviewTemplate.content.cloneNode(true).firstElementChild;
    review.querySelector('.review__name').textContent = item.name;
    review.querySelector('.review__place').textContent = item.place;
    review.querySelector('.review__date').textContent = item.date;
    review.querySelector('.review__text').textContent = item.text;
    review.querySelector('.review__place').setAttribute('data-ymaps-x', item.x);
    review.querySelector('.review__place').setAttribute('data-ymaps-y', item.y);
    balloon.appendChild(review);
  });
  return result;
}

ymaps
  .load(
    'https://api-maps.yandex.ru/2.1/?apikey=0b1ae83c-cabe-4a13-94d9-9910b90ef315&lang=ru_RU'
  )
  .then(function init(ymaps) {
    const myMap = new ymaps.Map(mapContainer, {
      center: [55.76, 37.64],
      zoom: 14,
    });

    const reviewFormBalloonContentLayout = ymaps.templateLayoutFactory.createClass(
      document.getElementById('reviewFormBalloonContentLayout').content.cloneNode(true)
        .firstElementChild.outerHTML
    );
    const carouselBalloonItemContentLayout = ymaps.templateLayoutFactory.createClass(
      document.getElementById('carouselBalloonItemContentLayout').content.cloneNode(true)
        .firstElementChild.outerHTML
    );
    const carouselBalloonContentLayout = ymaps.templateLayoutFactory.createClass(
      document.getElementById('carouselBalloonContentLayout').content.cloneNode(true)
        .firstElementChild.outerHTML
    );

    function setDocumentTitle(coords) {
      ymaps.geocode(coords).then(function (res) {
        const firstGeoObject = res.geoObjects.get(0);
        document.title = firstGeoObject.getAddressLine();
      });
    }

    function getObjectsByCoords(x, y) {
      const objects = [];
      const points = getGeoFromLocal();
      points.forEach((item) => {
        if (x === item.x && y === item.y) {
          objects.push(item);
        }
      });
      return objects;
    }

    // init clusterer
    const points = getGeoFromLocal();
    const geoObjects = [];
    function getPointData(index) {
      return {
        x: points[index].x,
        y: points[index].y,
        name: points[index].name,
        place: points[index].place,
        text: points[index].text,
        date: points[index].date,
      };
    }
    for (let i = 0, len = points.length; i < len; i++) {
      geoObjects[i] = new ymaps.Placemark([points[i].x, points[i].y], getPointData(i), {
        balloonContentLayout: reviewFormBalloonContentLayout,
      });
    }
    const clusterer = new ymaps.Clusterer({
      clusterBalloonContentLayout: carouselBalloonContentLayout,
      clusterBalloonItemContentLayout: carouselBalloonItemContentLayout,
      clusterDisableClickZoom: true,
      clusterBalloonPagerVisible: false,
      clusterBalloonContentLayoutWidth: 150,
      clusterBalloonContentLayoutHeight: 130,
    });
    clusterer.add(geoObjects);
    myMap.geoObjects.add(clusterer);

    // клик по карте
    myMap.events.add('click', (e) => {
      if (!myMap.balloon.isOpen()) {
        const coords = e.get('coords');
        setDocumentTitle(coords);
        myMap.balloon.open(
          coords,
          { coords: coords },
          { contentLayout: reviewFormBalloonContentLayout }
        );
      } else {
        myMap.balloon.close();
      }
    });

    // клик по объектам
    myMap.geoObjects.events.add('click', (e) => {
      const coords = e.get('coords');
      setDocumentTitle(coords);
    });

    // клик внутри баллуна
    document.addEventListener('click', (e) => {
      // клик по кнопке внутри баллуна
      if (e.target.classList.contains('button')) {
        e.preventDefault();
        const coords = myMap.balloon.getData().geometry
          ? myMap.balloon.getData().geometry.getCoordinates()
          : myMap.balloon.getData().coords;
        const form = document.querySelector('.review__form');
        if (form.name.value === '' || form.place.value === '' || form.text.value === '') {
          alert('Поля формы должны быть заполены!');
          return;
        }
        const data = {
          x: coords[0],
          y: coords[1],
          name: form.name.value,
          place: form.place.value,
          text: form.text.value,
          date: getDate(),
        };
        saveGeoToLocal(data);
        const placemark = new ymaps.Placemark(coords, data, {
          balloonContentLayout: reviewFormBalloonContentLayout,
        });
        myMap.geoObjects.add(placemark);
        clusterer.add(placemark);
        myMap.balloon.close();
      } // клик по ссылке карусели
      else if (e.target.classList.contains('carousel__link')) {
        const x = Number(e.target.getAttribute('data-ymaps-x'));
        const y = Number(e.target.getAttribute('data-ymaps-y'));
        const objects = getObjectsByCoords(x, y);
        const customBalloon = document.body.appendChild(createCustomBalloon(objects));
        myMap.balloon.close();
        document.addEventListener(
          'click',
          (e) => document.body.removeChild(customBalloon),
          { once: true }
        );
      }
    });
  });
