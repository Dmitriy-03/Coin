import { el, setChildren, unmount } from 'redom';
import { createNavBlock, createTransactionsBlock } from './accountView.js';
import { Dynamic, DynamicFromTo } from './dynamic.js';
import { getInfoAboutAccount, createError } from './api.js';

export async function createBalanceHistory(accNumber) {
  const token = localStorage.getItem('token');

  const $main = document.querySelector('main');
  const $container = el('.pay-history');
  setChildren($main, $container);

  const $navFrame = el('.pay-history');
  const $grid = el('.pay-history__grid');
  setChildren($container, [$navFrame, $grid]);

  const $dynamicFrame = el('.pay-history');
  const $fromToFrame = el('.pay-history');
  const $transFrame = el('.pay-history');
  setChildren($grid, [$dynamicFrame, $fromToFrame, $transFrame]);

  const response = await getInfoAboutAccount(token, accNumber);
  if (response.error) {
    createError(response.error);
  } else {
    createNavBlock(
      response.payload,
      $container,
      'История баланса',
      `accounts/${response.payload.account}`,
      'pay-history'
    );

    new Dynamic(response.payload, $grid, 'pay-history', 12).createChart();
    new DynamicFromTo(response.payload, $grid, 'pay-history', 12).createChart();
    createTransactionsBlock(response.payload, $grid, 'pay-history');

    const $historyBlock = document.querySelector('.transactions');
    const $dynamicBlock = document.querySelector('.dynamic_year');
    const $fromToBlock = document.querySelectorAll('.dynamic_from-to');

    if (
      $dynamicBlock &&
      $historyBlock &&
      $fromToBlock &&
      document.querySelector('.nav')
    ) {
      unmount($grid, $dynamicFrame);
      unmount($grid, $fromToFrame);
      unmount($grid, $transFrame);
      unmount($container, $navFrame);
    }
  }
}
