/* eslint-disable no-undef */
/// <reference types="cypress" />

describe('Возможность авторизоваться', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080');
  });

  it('Ввод корректного логина и пароля', () => {
    cy.get('#login').type('developer');
    cy.get('#password').type('skillbox');
    cy.get('.start__button').click();
    cy.get('main').children().should('have.class', 'accounts');
  });

  it('Ввод корректного логина и некорректного пароля', () => {
    cy.get('#login').type('developer');
    cy.get('#password').type('qwerty');
    cy.get('.start__button').click();
    cy.get('main').children().should('have.class', 'start');
    cy.get('.errors').children();
  });

  it('Ввод некорректного логина и корректного пароля', () => {
    cy.get('#login').type('qwerty');
    cy.get('#password').type('skillbox');
    cy.get('.start__button').click();
    cy.get('main').children().should('have.class', 'start');
    cy.get('.errors').children();
  });
});

describe('Возможность просмотреть список счетов', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080');
    cy.get('#login').type('developer');
    cy.get('#password').type('skillbox');
    cy.get('.start__button').click();
  });

  it('При заходе на страницу счетов после авторизации отображается список счетов', () => {
    cy.get('main').children().should('have.class', 'accounts');
  });

  it('При переходе с других страниц сайта отображается список счетов на странице счетов ', () => {
    cy.get('.header__link').eq(0).click();
    cy.get('.header__link').eq(1).click();
    cy.get('main').children().should('have.class', 'accounts');
  });
});

describe('Возможность создать новый счёт и перевести с него сумму', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080');
    cy.get('#login').type('developer');
    cy.get('#password').type('skillbox');
    cy.get('.start__button').click();
  });

  it('При нажатии на кнопку "Создать новый счет" создаётся новый счёт', () => {
    let beforeLength = 0;
    cy.get('.account-item').each(() => {
      beforeLength = beforeLength + 1;
    });
    cy.get('.accounts__button')
      .click()
      .then(() =>
        cy.get('.account-item').should('have.length', beforeLength + 1)
      );
  });

  it('Возможность пополнить новый счет', () => {
    cy.get('.account-item__number')
      .last()
      .invoke('text')
      .then((res) => {
        const newAccNumber = res;
        cy.get('.account-item__balance')
          .last()
          .invoke('text')
          .then(() => {
            const amount = '200';
            cy.get('.account-item__button').eq(0).click();
            cy.get('.transfer__input').eq(0).type(newAccNumber);
            cy.get('.transfer__input').eq(1).type(amount);
            cy.get('.transfer__button').click();
            cy.wait(500);
            cy.get('.nav__back-button').click();
            cy.get('.account-item__balance')
              .last()
              .should('have.text', `${amount} ₽`);
          });
      });
  });
});
