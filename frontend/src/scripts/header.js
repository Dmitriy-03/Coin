import { el, setChildren, mount } from 'redom';
import Navigo from 'navigo';
import logo from '/src/assets/img/logo.svg';
import { createAccountsPage } from './account.js';
import { createStartPage } from './loginForm.js';
import { createMap } from './map.js';
import { createCurrencyPage } from './currencyExchange.js';

export const router = new Navigo('/', { strategy: 'ALL' });

export function createHeader() {
  function createHeaderLink(text, link, parent) {
    const $headerLink = el('a.header__link', text, {
      href: `/${link}`,
      onclick(e) {
        e.preventDefault();
        router.navigate(e.target.getAttribute('href'));
      },
    });

    const $headerListItem = el('li.header__list-item');

    setChildren($headerListItem, $headerLink);
    mount(parent, $headerListItem);
  }

  const $main = el('main');
  const $header = el('header.header');
  const $errors = el('.errors');
  setChildren(document.body, [$header, $main, $errors]);

  const $headerContainer = el('.header__container');
  setChildren($header, $headerContainer);

  const $headerLogo = el('img.header__logo', {
    src: logo,
    alt: 'Логотип',
  });
  setChildren($headerContainer, $headerLogo);

  const $linkList = el('ul.header__list');
  mount($headerContainer, $linkList);

  createHeaderLink('Банкоматы', 'atms', $linkList);
  createHeaderLink('Счета', 'accounts', $linkList);
  createHeaderLink('Валюта', 'currency', $linkList);
  createHeaderLink('Выйти', 'login', $linkList);

  const token = localStorage.getItem('token');

  router.on('/login', () => {
    createStartPage();
    localStorage.removeItem('token');
    $linkList.style.display = 'none';
  });

  router.on('/accounts', () => {
    createAccountsPage(token);
    $linkList.style.display = 'flex';
    $linkList.querySelector('[href="/accounts"]').classList.add('active');
  });

  router.on('/atms', () => {
    createMap();
    $linkList.querySelector('[href="/atms"]').classList.add('active');
  });

  router.on('/currency', () => {
    createCurrencyPage(token);
    $linkList.querySelector('[href="/currency"]').classList.add('active');
  });

  router.on(/.*/, () => {
    for (const link of document.querySelectorAll('.header__link')) {
      if (window.location.href == link.href) {
        link.classList.remove('active');
      }
    }
  });
}
