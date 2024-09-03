import { el, setChildren, unmount } from 'redom';
import { getBanks, createError } from './api.js';
import ymaps from 'ymaps';

export async function createMap() {
  const $main = document.querySelector('main');
  const $container = el('.atms');
  setChildren($main, $container);

  const $heading = el('h1.atms__heading', 'Карта банкоматов');
  const $map = el('.atms__map');
  setChildren($container, [$heading, $map]);

  const $frame = el('.atms');
  setChildren($map, $frame);

  const atmsArray = await getBanks();

  if (atmsArray.error) {
    createError(atmsArray.error);
  } else {
    ymaps
      .load('https://api-maps.yandex.ru/2.1/?lang=ru_RU&amp;apikey=API_KEY')
      .then((maps) => {
        unmount($map, $frame);
        const myMap = new maps.Map($map, {
          center: [55.75, 37.6],
          zoom: 11,
        });
        for (const atm of atmsArray.payload) {
          const placemark = new maps.Placemark([atm.lat, atm.lon], {});
          myMap.geoObjects.add(placemark);
        }
      })
      .catch((error) => createError(error));
  }
}
