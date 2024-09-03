import { el, setChildren, mount } from 'redom';
import Chart from 'chart.js/auto';

const options = {
  month: 'long',
};

export class Dynamic {
  constructor(acc, container, className, sumOfMonths) {
    this.sumOfMonths = sumOfMonths;
    this.block = el(`.dynamic.${className}__dynamic-block`);
    mount(container, this.block);

    this.heading = el('h3.dynamic__heading', 'Динамика баланса');
    this.chart = el('.dynamic__chart');
    setChildren(this.block, [this.heading, this.chart]);

    this.canvas = el('canvas.dynamic__canvas');
    setChildren(this.chart, this.canvas);

    this.currentDate = new Date();
    this.transArray = acc.transactions;
    this.transArrayBefore = [];
    this.transArrayAfter = [];

    for (const trans of this.transArray) {
      if (
        (this.currentDate - new Date(trans.date)) /
          (60 * 60 * 24 * 1000 * 365) >
        0.5
      ) {
        this.transArrayBefore.push(trans);
      } else {
        this.transArrayAfter.push(trans);
      }
    }

    this.startBalance = 0;
    if (this.transArrayBefore.length > 0) {
      for (const trans of this.transArrayBefore) {
        const amount = parseInt(trans.amount);
        if (trans.from == acc.account) {
          this.startBalance = this.startBalance - amount;
        } else {
          this.startBalance = this.startBalance + amount;
        }
      }
    }

    this.changeBalanceArray = [];
    let balance;

    for (let i = 0; i < this.transArrayAfter.length; i++) {
      const element = this.transArrayAfter[i];

      if (element.from == acc.account && i == 0) {
        balance = this.startBalance - parseInt(this.transArrayAfter[i].amount);
      }
      if (element.from == acc.account && i != 0) {
        balance =
          this.changeBalanceArray[i - 1].balance -
          parseInt(this.transArrayAfter[i].amount);
      }
      if (element.from != acc.account && i == 0) {
        balance = this.startBalance + parseInt(this.transArrayAfter[i].amount);
      }
      if (element.from != acc.account && i != 0) {
        balance =
          this.changeBalanceArray[i - 1].balance +
          parseInt(this.transArrayAfter[i].amount);
      }
      const month = new Date(element.date)
        .toLocaleString('ru', options)
        .slice(0, 3);
      this.changeBalanceArray.push({ balance, month });
    }

    this.currnetMonth = this.currentDate.getMonth() + 1;
    this.monthMaxArray = [];
    this.createBaseArray(this.monthMaxArray);

    for (const item of this.monthMaxArray) {
      const resArr = this.changeBalanceArray.filter(
        (i) => i.month == item.month
      );
      if (resArr.length != 0) {
        const maxBalance = resArr.sort((a, b) => b.balance - a.balance)[0]
          .balance;
        item.maxBalance = maxBalance;
      }
    }

    Chart.defaults.color = '#000000';
    Chart.defaults.font.size = 20;
    Chart.defaults.font.lineHeight = '24px';
    Chart.defaults.font.weight = 700;
    Chart.defaults.font.family = "'Work Sans', sans-serif";

    this.colorArray = [];

    if (this.sumOfMonths == 12) {
      this.block.classList.add('dynamic_year');
      this.colorArray = [
        'black',
        '#fff',
        '#fff',
        '#fff',
        '#fff',
        '#fff',
        '#fff',
        '#fff',
        '#fff',
        '#fff',
        '#fff',
        '#fff',
        'black',
      ];
    }
    if (this.sumOfMonths == 6) {
      this.colorArray = [
        'black',
        '#fff',
        '#fff',
        '#fff',
        '#fff',
        '#fff',
        'black',
      ];
    }
  }

  createBaseArray(arr) {
    for (let i = 0; i < this.sumOfMonths; i++) {
      let month;
      if (this.currnetMonth - i <= 0) {
        month = new Date(
          `${this.sumOfMonths - (i - this.currnetMonth)}.01.2023`
        )
          .toLocaleString('ru', options)
          .slice(0, 3);
      } else {
        month = new Date(`${this.currnetMonth - i}.01.2023`)
          .toLocaleString('ru', options)
          .slice(0, 3);
      }
      arr.push({ month: month, maxBalance: 0 });
    }
  }

  createChart() {
    this.chartItem = new Chart(this.canvas, {
      type: 'bar',
      data: {
        labels: this.monthMaxArray.reverse().map((row) => row.month),
        datasets: [
          {
            data: this.monthMaxArray.map((row) => row.maxBalance),
            backgroundColor: '#116ACC',
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            border: {
              color: 'black',
            },
            grid: {
              color: this.colorArray,
              tickColor: '#fff',
            },
          },
          y: {
            position: 'right',
            ticks: {
              min: 0,
              max: this.monthMaxArray
                .map((row) => row.maxBalance)
                .sort((a, b) => b - a)[0],
              stepSize: this.monthMaxArray
                .map((row) => row.maxBalance)
                .sort((a, b) => b - a)[0],
            },
            border: {
              color: 'black',
            },
            grid: {
              color: 'black',
              tickColor: '#fff',
            },
          },
        },
      },
    });
  }
}

export class DynamicFromTo extends Dynamic {
  constructor(acc, container, className, sumOfMonths) {
    super(acc, container, className, sumOfMonths);
    this.block.classList.add('dynamic_from-to');
    this.heading.textContent = 'Соотношение входящих исходящих транзакций';

    this.minusArray = this.transArrayAfter.filter(
      (elem) => elem.from == acc.account
    );
    this.plusArray = this.transArrayAfter.filter(
      (elem) => elem.from != acc.account
    );

    this.changeBalanceMinusArr = [];
    this.createTransArr(this.minusArray, this.changeBalanceMinusArr);

    this.changeBalancePlusArr = [];
    this.createTransArr(this.plusArray, this.changeBalancePlusArr);

    this.minusBaseArray = [];
    this.createBaseArray(this.minusBaseArray);

    this.plusBaseArray = [];
    this.createBaseArray(this.plusBaseArray);

    this.sumOfArr(this.minusBaseArray, this.changeBalanceMinusArr);
    this.sumOfArr(this.plusBaseArray, this.changeBalancePlusArr);

    this.finalArr = [];
    for (let i = 0; i < this.minusBaseArray.length; i++) {
      const minusEl = this.minusBaseArray[i];
      const plusEl = this.plusBaseArray[i];
      let minus, plus;

      if (minusEl + plusEl != 0) {
        minus =
          (minusEl.maxBalance / (minusEl.maxBalance + plusEl.maxBalance)) *
          this.monthMaxArray[i].maxBalance;

        plus =
          (plusEl.maxBalance / (minusEl.maxBalance + plusEl.maxBalance)) *
          this.monthMaxArray[i].maxBalance;
      }

      this.finalArr.push({
        minus: minus,
        plus: plus,
        month: minusEl.month,
      });
    }
  }

  createTransArr(arr1, arr2) {
    for (const item of arr1) {
      const month = new Date(item.date)
        .toLocaleString('ru', options)
        .slice(0, 3);
      arr2.push({ amount: parseInt(item.amount), month: month });
    }
  }

  sumOfArr(arr1, arr2) {
    for (const item of arr1) {
      const resArr = arr2.filter((i) => i.month == item.month);
      if (resArr.length != 0) {
        let sum = 0;
        for (const item of resArr) {
          sum = sum + item.amount;
        }
        item.maxBalance = sum;
      }
    }
  }

  createChart() {
    this.chartItem = new Chart(this.canvas, {
      type: 'bar',
      data: {
        labels: this.finalArr.reverse().map((row) => row.month),
        datasets: [
          {
            data: this.finalArr.map((row) => row.minus),
            backgroundColor: '#FD4E5D',
          },
          {
            data: this.finalArr.map((row) => row.plus),
            backgroundColor: '#76CA66',
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            stacked: true,
            border: {
              color: 'black',
            },
            grid: {
              color: this.colorArray,
              tickColor: '#fff',
            },
          },
          y: {
            stacked: true,
            position: 'right',
            ticks: {
              min: 0,
              max: this.monthMaxArray
                .map((row) => row.maxBalance)
                .sort((a, b) => b - a)[0],
              stepSize: this.monthMaxArray
                .map((row) => row.maxBalance)
                .sort((a, b) => b - a)[0],
            },
            border: {
              color: 'black',
            },
            grid: {
              color: 'black',
              tickColor: '#fff',
            },
          },
        },
      },
    });
  }
}
