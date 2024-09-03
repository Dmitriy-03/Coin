import { el, setChildren, mount } from 'redom';
import Choices from 'choices.js';
import { getAccounts, createAccount, createError } from './api.js';
import { createExtendedInfo } from './accountView.js';
import { router } from './header.js';

const options = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

export class Account {
  constructor(container, accountObject) {
    this.body = el('li.accounts__item.account-item');
    this.number = el('h2.account-item__number', accountObject.account);
    this.balance = el(
      'p.account-item__balance',
      `${accountObject.balance.toLocaleString('ru-RU')} ₽`
    );
    this.lastTransactionHeading = el(
      'h3.account-item__lt-heading',
      'Последняя транзакция:'
    );
    if (accountObject.transactions.length != 0) {
      this.lastTransaction = el(
        'p.account-item__lt-date',
        new Date(accountObject.transactions[0].date)
          .toLocaleString('ru', options)
          .slice(0, -3)
      );
    } else {
      this.lastTransaction = el('p.account-item__lt-date', '');
    }

    this.button = el('button.account-item__button', 'Открыть', {
      onclick: () => {
        router.navigate(`accounts/${accountObject.account}`);
      },
    });

    setChildren(this.body, [
      this.number,
      this.balance,
      this.lastTransactionHeading,
      this.lastTransaction,
      this.button,
    ]);

    mount(container, this.body);

    router.on(`accounts/${accountObject.account}`, () => {
      createExtendedInfo(accountObject.account);
    });
  }
}

function createAccounts(container) {
  const $frame = el('ul.accounts');
  mount(container, $frame);

  for (let i = 0; i < 6; i++) {
    const $frameItem = el('li');
    mount($frame, $frameItem);
  }
}

export async function createAccountsPage() {
  const $main = document.querySelector('main');
  const token = localStorage.getItem('token');

  const $container = el('.accounts');
  setChildren($main, $container);

  const $navigationBlock = el('.accounts__top');
  const $accountsList = el('ul.accounts__list');
  setChildren($container, [$navigationBlock, $accountsList]);

  const $heading = el('h1.accounts__heading', 'Ваши счета');
  const $sort = el('select.accounts__sort');
  const $addButton = el(
    'button.accounts__button',
    { disabled: true },
    'Создать новый счёт'
  );
  setChildren($navigationBlock, [$heading, $sort, $addButton]);
  createAccounts($container);

  const $sortByNumber = el(
    'option.accounts__sort-option',
    { value: 'number' },
    'По номеру'
  );
  const $sortByBalance = el(
    'option.accounts__sort-option',
    { value: 'balance' },
    'По балансу'
  );
  const $sortByLastTransaction = el(
    'option.accounts__sort-option',
    { value: 'last-transaction' },
    'По последней транзакции'
  );
  const $sortPlaceholder = el(
    'option.accounts__sort-option',
    { value: 'placeholder' },
    'Сортировка'
  );
  setChildren($sort, [
    $sortPlaceholder,
    $sortByNumber,
    $sortByBalance,
    $sortByLastTransaction,
  ]);

  const choices = new Choices($sort, {
    searchEnabled: false,
    itemSelectText: '',
    shouldSort: false,
  });

  choices.disable();

  $sort.addEventListener('change', () => {
    $accountsList.innerHTML = '';
    console.log(accountsArray.payload);

    switch ($sort.value) {
      case 'number':
        accountsArray.payload = accountsArray.payload.sort(
          (a, b) => a.account - b.account
        );
        break;
      case 'balance':
        accountsArray.payload = accountsArray.payload.sort(
          (a, b) => a.balance - b.balance
        );
        break;
      case 'last-transaction':
        accountsArray.payload = accountsArray.payload.sort(function (a, b) {
          if (a.transactions.length == 1 && b.transactions.length == 0) {
            return 1;
          } else if (b.transactions.length == 1 && a.transactions.length == 0) {
            return -1;
          } else if (a.transactions.length == 0 && b.transactions.length == 0) {
            return 0;
          } else
            return new Date(a.transactions[0].date) >
              new Date(b.transactions[0].date)
              ? 1
              : new Date(b.transactions[0].date) >
                new Date(a.transactions[0].date)
              ? -1
              : 0;
        });
        break;
    }
    renderAccounts();
  });

  $addButton.addEventListener('click', async () => {
    const accountItem = await createAccount(token);
    if (accountItem.error) {
      createError(accountItem.error);
    } else {
      new Account($accountsList, accountItem.payload);
      accountsArray.payload.push(accountItem.payload);
    }
  });

  function renderAccounts() {
    if (accountsArray.payload.length != 0) {
      for (const oneAccount of accountsArray.payload) {
        new Account($accountsList, oneAccount);
      }
    }
  }

  const accountsArray = await getAccounts(token);
  if (accountsArray.error) {
    createError(accountsArray.error);
  } else {
    if (document.querySelector('.acc-frame')) {
      document.querySelector('.acc-frame').remove();
    }
    $addButton.disabled = false;
    choices.enable();
    renderAccounts();
  }
}
