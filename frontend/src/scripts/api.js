import { el, setChildren, mount } from 'redom';

export function createError(text) {
  const $container = document.querySelector('.errors');
  const $item = el('.errors__item');
  mount($container, $item);

  const $text = el('p.errors__text', text);
  const $closeButton = el('button.errors__close-button');
  setChildren($item, [$text, $closeButton]);

  $closeButton.addEventListener('click', () => {
    $item.remove();
  });

  setTimeout(() => {
    if ($item) {
      $item.remove();
    }
  }, 5000);
}

function catchErr(res) {
  if (res.status == 504) {
    createError(`${res.status}: Ошибка работы сервера`);
  }
  if (res.status == 404) {
    createError(`${res.status}: Такой страницы не существует`);
  }
  if (res.status == 200) {
    return res.json();
  }
}

export async function createAccount(token) {
  return await fetch('/api/create-account', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${token}`,
    },
  }).then((res) => catchErr(res));
}

export async function getAccounts(token) {
  return await fetch('/api/accounts', {
    method: 'GET',
    headers: {
      Authorization: `Basic ${token}`,
    },
  }).then((res) => catchErr(res));
}

export async function getInfoAboutAccount(token, id) {
  return await fetch(`/api/account/${id}`, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${token}`,
    },
  }).then((res) => catchErr(res));
}

export async function getPayload(login, password) {
  return await fetch('/api/login', {
    method: 'POST',
    body: JSON.stringify({
      login: login.trim(),
      password: password.trim(),
    }),
    headers: {
      'Content-type': 'application/json',
    },
  }).then((res) => catchErr(res));
}

export async function transfer(token, accFrom, accTo, transferAmount) {
  return await fetch('/api/transfer-funds', {
    method: 'POST',
    body: JSON.stringify({
      from: accFrom,
      to: accTo,
      amount: transferAmount,
    }),
    headers: {
      Authorization: `Basic ${token}`,
      'Content-type': 'application/json',
    },
  }).then((res) => catchErr(res));
}

export async function getBanks() {
  return await fetch('/api/banks').then((res) => catchErr(res));
}

export async function getCurrencies(token) {
  return await fetch('/api/currencies', {
    method: 'GET',
    headers: {
      Authorization: `Basic ${token}`,
    },
  }).then((res) => catchErr(res));
}

export async function getAllCurrencies(token) {
  return await fetch('/api/all-currencies', {
    method: 'GET',
    headers: {
      Authorization: `Basic ${token}`,
    },
  }).then((res) => catchErr(res));
}

export async function currencyBuy(token, from, to, amount) {
  return await fetch('/api/currency-buy', {
    method: 'POST',
    body: JSON.stringify({
      from: from,
      to: to,
      amount: amount,
    }),
    headers: {
      Authorization: `Basic ${token}`,
      'Content-type': 'application/json',
    },
  }).then((res) => catchErr(res));
}
