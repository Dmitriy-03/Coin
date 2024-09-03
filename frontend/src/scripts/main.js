import 'babel-polyfill';
import 'choices.js/src/styles/choices.scss';
import '/src/style/main.scss';
import { router } from './header.js';
import { createHeader } from './header.js';
import { createExtendedInfo } from './accountView.js';
import { createBalanceHistory } from './balanceHistory.js';

createHeader();

const reg = /^\d+$/;
const pathname = window.location.pathname;

if (reg.test(pathname.slice(-13))) {
  const account = pathname.split('/').slice(-1);
  router.on(`accounts/${account}`, () => {
    createExtendedInfo(account);
  });
}

if (pathname.slice(-7) == 'history') {
  const arr = pathname.split('/');
  const account = arr[arr.length - 2];
  router.on(`accounts/${account}/history`, () => {
    createBalanceHistory(account);
  });
  router.on(`accounts/${account}`, () => {
    createExtendedInfo(account);
  });
}

if (localStorage.getItem('token')) {
  if (pathname != '/') {
    router.navigate(pathname);
  } else {
    router.navigate('accounts');
  }
} else {
  router.navigate('/login');
}
