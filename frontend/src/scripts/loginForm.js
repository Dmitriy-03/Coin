import { el, setChildren, mount } from 'redom';
import validator from 'validator';
import { router } from './header.js';
import { getPayload, createError } from './api.js';

export function createInput(
  labelText,
  inputType,
  inputPlaceholder,
  inputID,
  container,
  validElem,
  className,
  validRule
) {
  const $label = el(`label.${className}__label`);
  mount(container, $label);

  const $input = el(`input.${className}__input`, {
    placeholder: inputPlaceholder,
    type: inputType,
    id: inputID,
  });
  const $labelText = el(`span.${className}__label-text`, labelText);
  setChildren($label, [$labelText, $input]);

  $input.addEventListener('input', () => {
    let inputValidation;

    switch (validRule) {
      case 'alphanumeric':
        inputValidation = validator.isAlphanumeric($input.value);
        break;
      case 'account':
        inputValidation = validator.isInt($input.value, {
          min: 1,
        });
        break;
      case 'amount':
        if ($input.value.includes('.')) {
          inputValidation = validator.isFloat($input.value, {
            min: 0.1,
          });
        } else {
          inputValidation = validator.isInt($input.value, {
            min: 1,
          });
        }
        break;
    }

    if (inputValidation) {
      $input.classList.add('valid');
      $input.classList.remove('error');
    } else {
      $input.classList.add('error');
      $input.classList.remove('valid');
    }

    if (
      document.querySelectorAll('.valid').length ==
      document.querySelectorAll(`.${className}__input`).length
    ) {
      validElem.disabled = false;
    } else {
      validElem.disabled = true;
    }
  });
}

export function createStartPage() {
  const $main = document.querySelector('main');
  const $container = el('.start');
  setChildren($main, $container);

  const $form = el('form.start__form');
  setChildren($container, $form);

  const $heading = el('h1.start__heading', 'Вход в аккаунт');
  mount($form, $heading);

  const $button = el('button.start__button', 'Войти', {
    type: 'submit',
    disabled: 'true',
  });

  createInput(
    'Логин',
    'text',
    'Введите логин',
    'login',
    $form,
    $button,
    'start',
    'alphanumeric'
  );
  createInput(
    'Пароль',
    'password',
    'Введите пароль',
    'password',
    $form,
    $button,
    'start',
    'alphanumeric'
  );

  mount($form, $button);

  $form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const login = document.getElementById('login').value;
    const password = document.getElementById('password').value;

    const response = await getPayload(login, password);
    if (response.error) {
      createError(response.error);
    } else {
      localStorage.setItem('token', response.payload.token);
      router.navigate('accounts');
    }
  });
}
