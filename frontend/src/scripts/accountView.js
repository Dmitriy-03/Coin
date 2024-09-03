import { el, setChildren, mount, unmount } from 'redom';
import { router } from './header.js';
import { createInput } from './loginForm.js';
import { transfer, getInfoAboutAccount, createError } from './api.js';
import { createBalanceHistory } from './balanceHistory.js';
import { Dynamic } from './dynamic.js';

export function createNavBlock(
  acc,
  container,
  headingText,
  backLink,
  className
) {
  const $navigationBlock = el(`.${className}__nav.nav`);
  mount(container, $navigationBlock, container.firstChild);

  const $navTopBlock = el('.nav__top');
  const $mainInfoBlock = el('.nav__main-info');
  setChildren($navigationBlock, [$navTopBlock, $mainInfoBlock]);

  const $heading = el('h1.nav__heading', headingText);
  const $button = el(
    'button.nav__back-button',
    {
      onclick: () => {
        router.navigate(backLink);
      },
    },
    'Вернуться назад'
  );
  setChildren($navTopBlock, [$heading, $button]);

  const $accountNumber = el('h2.nav__number', `№ ${acc.account}`);
  const $balance = el('.nav__balance');
  setChildren($mainInfoBlock, [$accountNumber, $balance]);

  const $balanceHeading = el('h3.nav__balance-heading', 'Баланс');
  const $balanceText = el(
    'p.nav__balance-text',
    `${acc.balance.toLocaleString('ru-RU')} ₽`
  );
  setChildren($balance, [$balanceHeading, $balanceText]);
}

function createTransferBlock(accNumber, container, className, token) {
  console.log(localStorage);
  const $block = el(`form.transfer.${className}__transfer-block`);
  mount(container, $block);

  const $heading = el('h3.transfer__heading', 'Новый перевод');
  setChildren($block, $heading);

  const $button = el(
    'button.transfer__button',
    { type: 'submit', disabled: 'true' },
    'Отправить'
  );

  createInput(
    'Номер счёта получателя',
    'number',
    'Введите номер счета',
    'account',
    $block,
    $button,
    'transfer',
    'account'
  );
  createInput(
    'Сумма перевода',
    'number',
    'Введите сумму',
    'amount',
    $block,
    $button,
    'transfer',
    'amount'
  );

  const $numberInput = document.getElementById('account');
  $numberInput.autocomplete = 'off';
  $numberInput.disabled = true;
  const $numberInputLabel = $numberInput.parentNode;
  const $numberAutocomplete = el('.transfer__autocomplete');
  mount($numberInputLabel, $numberAutocomplete);

  let accountsArray = localStorage.getItem('accountsArray');

  function renderAccList(arr) {
    $numberAutocomplete.innerHTML = '';
    for (const item of arr) {
      const $autoItem = el('button.transfer__autocomplete-button', item);
      mount($numberAutocomplete, $autoItem);

      $autoItem.addEventListener('click', (e) => {
        e.preventDefault();
        $numberInput.value = $autoItem.textContent;
        $numberAutocomplete.classList.remove('visible');
      });
    }
  }

  function filter(arr, value) {
    return arr.filter((number) => number.toString().includes(value.trim()));
  }

  if (accountsArray) {
    accountsArray = JSON.parse(accountsArray);
    renderAccList(accountsArray);

    $numberInput.addEventListener('input', () => {
      let accountsArrayCopy = accountsArray.filter(
        (number) => number != accNumber
      );
      $numberAutocomplete.classList.add('visible');
      accountsArrayCopy = filter(accountsArrayCopy, $numberInput.value);
      renderAccList(accountsArrayCopy);
    });

    document.addEventListener('click', (e) => {
      if (
        !e.target.closest(
          document.querySelector('.transfer__autocomplete') != null
        )
      ) {
        $numberAutocomplete.classList.remove('visible');
      }
    });
  }

  const $amountInput = document.getElementById('amount');
  $amountInput.disabled = true;
  $amountInput.min = '0.01';
  $numberInput.min = '1';
  $amountInput.step = '0.01';
  mount($block, $button);

  $block.addEventListener('submit', async (e) => {
    e.preventDefault();
    const response = await transfer(
      token,
      accNumber,
      $numberInput.value,
      $amountInput.value
    );

    if (response.error) {
      createError(response.error);
    } else {
      if (
        accountsArray &&
        !accountsArray.includes($numberInput.value.toString())
      ) {
        accountsArray.push($numberInput.value);
        localStorage.setItem('accountsArray', JSON.stringify(accountsArray));
      }

      if (!accountsArray) {
        localStorage.setItem(
          'accountsArray',
          JSON.stringify([$numberInput.value])
        );
      }
      createExtendedInfo(accNumber);
    }
  });
}

export function createTransactionsBlock(acc, container, className) {
  const $block = el(`.transactions.${className}__transactions-block`);
  mount(container, $block);

  const $heading = el('h3.transactions__heading', 'История переводов');
  const $table = el('table.transactions__table');
  setChildren($block, [$heading, $table]);

  const $tableHead = el('tr.transactions__table-head');
  const tableHeadCols = [
    'Счёт отправителя',
    'Счёт получателя',
    'Сумма',
    'Дата',
  ];
  for (const col of tableHeadCols) {
    const $tableHeadTd = el('td.transactions__table-head-td', col);
    mount($tableHead, $tableHeadTd);
  }

  const transactionsArray = acc.transactions.slice(-10);

  const options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  };

  for (const trans of transactionsArray) {
    const $tr = el('tr.transactions__table-tr');
    const $accFromTd = el('td.transactions__table-td', trans.from);
    const $accToTd = el('td.transactions__table-td', trans.to);
    const $amountTd = el(
      'td.transactions__table-td',
      `${trans.amount.toLocaleString('ru-RU')} ₽`
    );
    if (trans.from == acc.account) {
      $amountTd.classList.add('minus');
    } else {
      $amountTd.classList.add('plus');
    }
    const $dateTd = el(
      'td.transactions__table-td',
      new Date(trans.date).toLocaleString('ru', options)
    );
    setChildren($tr, [$accFromTd, $accToTd, $amountTd, $dateTd]);
    mount($table, $tr, $table.firstChild);
  }
  mount($table, $tableHead, $table.firstChild);
}

export async function createExtendedInfo(accNumber) {
  const token = localStorage.getItem('token');

  const $main = document.querySelector('main');
  const $container = el('.extended-info');
  setChildren($main, $container);

  const $navFrame = el('.extended-info');
  const $grid = el('.extended-info__grid');
  setChildren($container, [$navFrame, $grid]);

  createTransferBlock(accNumber, $grid, 'extended-info', token);

  const $dynamicFrame = el('.extended-info');
  const $transFrame = el('.extended-info');
  mount($grid, $dynamicFrame);
  mount($grid, $transFrame);

  const response = await getInfoAboutAccount(token, accNumber);
  if (response.error) {
    createError(response.error);
  } else {
    createNavBlock(
      response.payload,
      $container,
      'Просмотр счета',
      'accounts',
      'extended-info'
    );
    if (response.payload.transactions.length != 0) {
      new Dynamic(response.payload, $grid, 'extended-info', 6).createChart();
      createTransactionsBlock(response.payload, $grid, 'extended-info');

      const $dynamicBlock = document.querySelector('.dynamic');
      const $historyBlock = document.querySelector('.transactions');

      if ($dynamicBlock) {
        $dynamicBlock.addEventListener('click', () => {
          router.navigate(`/accounts/${response.payload.account}/history`);
        });
      }

      if ($historyBlock) {
        $historyBlock.addEventListener('click', () => {
          router.navigate(`/accounts/${response.payload.account}/history`);
        });
      }

      if ($dynamicBlock && $historyBlock && document.querySelector('.nav')) {
        unmount($grid, $dynamicFrame);
        unmount($grid, $transFrame);
        unmount($container, $navFrame);
        document.getElementById('account').disabled = false;
        document.getElementById('amount').disabled = false;
      }

      router.on(`/accounts/${response.payload.account}/history`, () => {
        createBalanceHistory(response.payload.account);
      });
    } else {
      unmount($grid, $dynamicFrame);
      unmount($grid, $transFrame);
      unmount($container, $navFrame);
      document.getElementById('account').disabled = false;
      document.getElementById('amount').disabled = false;
    }
  }
}
