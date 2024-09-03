import { el, setChildren, mount, unmount } from 'redom';
import {
  getCurrencies,
  getAllCurrencies,
  currencyBuy,
  createError,
} from './api.js';
import Choices from 'choices.js';
import { createInput } from './loginForm.js';

async function createMyCurrencyBlock(container, token) {
  const $myCurrenciesFrame = el(
    '.currency__my-currencies-frame.my-currencies-frame'
  );
  mount(container, $myCurrenciesFrame);

  const currenciesArray = await getCurrencies(token);

  if (currenciesArray.error) {
    createError(currenciesArray.error);
  } else {
    unmount(container, $myCurrenciesFrame);

    const $block = el('.currency__my-currencies.my-currencies');
    mount(container, $block);

    const $heading = el('h2.my-currencies__heading', 'Ваши валюты');
    const $list = el('ul.my-currencies__list');
    setChildren($block, [$heading, $list]);

    for (const prop in currenciesArray.payload) {
      const $currencyTr = el('li.my-currencies__item');
      mount($list, $currencyTr);

      const $currencyCode = el('.my-currencies__code', prop);
      const $currencyAmount = el(
        '.my-currencies__amount',
        currenciesArray.payload[prop].amount
      );
      setChildren($currencyTr, [$currencyCode, $currencyAmount]);
    }
  }
}

async function createExchangeBlock(container, token) {
  function createChoices(id, labelText, container) {
    const $selectContainer = el('.exchange__select-container');
    const $select = el(`select.exchange__select#${id}`);
    const $selectLabel = el('span.exchange__span', labelText);
    setChildren($selectContainer, [$selectLabel, $select]);

    for (const item of currnciesArr.payload) {
      const $option = el('option.exchange__option', item);
      mount($select, $option);
    }

    new Choices($select, {
      searchEnabled: false,
      itemSelectText: '',
      shouldSort: false,
    });

    mount(container, $selectContainer);
  }

  const $exchangeFrame = el('.currency');
  mount(container, $exchangeFrame);

  const currnciesArr = await getAllCurrencies(token);

  if (currnciesArr.error) {
    createError(currnciesArr.error);
  } else {
    unmount(container, $exchangeFrame);
    const $block = el('form.currency__exchange-block.exchange');
    mount(container, $block);

    const $heading = el('h2.exchange__heading', 'Обмен валюты');
    setChildren($block, $heading);

    createChoices('exchange-from', 'Из', $block);
    createChoices('exchange-to', 'в', $block);

    const $button = el(
      'button.exchange__button',
      { type: 'submit', disabled: 'true' },
      'Обменять'
    );

    createInput(
      'Сумма',
      'number',
      'Введите сумму',
      'exchange-amount',
      $block,
      $button,
      'exchange',
      'amount'
    );

    mount($block, $button);

    $block.addEventListener('submit', async (e) => {
      e.preventDefault();
      const from = document.getElementById('exchange-from').value;
      const to = document.getElementById('exchange-to').value;
      const amount = document.getElementById('exchange-amount').value;

      const response = await currencyBuy(token, from, to, amount);
      if (response.error) {
        createError(response.error);
      } else {
        createCurrencyPage(token);
      }
    });
  }
}

function createRealTimeRatesBlock(container) {
  const socket = new WebSocket('ws://localhost:3000/currency-feed');

  const $realTimeRatesFrame = el('.currency');
  mount(container, $realTimeRatesFrame);

  socket.addEventListener('close', () => {
    createError('Соединение с сервером обновления курса валют прервано');
  });

  socket.addEventListener('error', () => {
    createError('Ошибка соединения с сервером обновления курса валют');
  });

  const $block = el('.currency__real-time-rates.real-time-rates');
  const $heading = el(
    'h2.real-time-rates__heading',
    'Изменение курсов в реальном времени'
  );
  const $changes = el('ul.real-time-rates__changes-list');

  socket.addEventListener('open', () => {
    unmount(container, $realTimeRatesFrame);
    mount(container, $block);
    setChildren($block, [$heading, $changes]);
  });

  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);

    const $currencyTr = el('li.real-time-rates__item');
    const $currencyCode = el(
      '.real-time-rates__code',
      `${message.from}/${message.to}`
    );
    const $currencyValue = el('.real-time-rates__value', message.rate);
    if (message.change == 1) {
      $currencyTr.classList.add('up');
    } else {
      $currencyTr.classList.add('down');
    }
    setChildren($currencyTr, [$currencyCode, $currencyValue]);

    mount($changes, $currencyTr, $changes.firstChild);

    const changesArr = $changes.querySelectorAll('.real-time-rates__item');
    if (changesArr.length == 22) {
      changesArr[21].remove();
    }
  });
}

export function createCurrencyPage(token) {
  const $main = document.querySelector('main');
  const $container = el('.currency');
  setChildren($main, $container);

  const $heading = el('h1.currency__heading', 'Валютный обмен');
  const $grid = el('.currency__grid');
  setChildren($container, [$heading, $grid]);

  createMyCurrencyBlock($grid, token);
  createExchangeBlock($grid, token);
  createRealTimeRatesBlock($grid);
}
