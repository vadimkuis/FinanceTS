import {Sidebars} from "./sidebars";
import {CustomHttp} from "../services/custom-http";
import {GetOperation} from "../services/getOperation";
import dayjs, {Dayjs} from "dayjs";
import config from "../../config/config";
import {OperationType} from "../types/operation.type";
import {DefaultResponseType} from "../types/default-response.type";

export class TableIncomeAndExpense {
  readonly createIncome: HTMLElement | null;
  readonly createExpense: HTMLElement | null;
  readonly today: HTMLElement | null;
  readonly week: HTMLElement | null;
  readonly month: HTMLElement | null;
  readonly year: HTMLElement | null;
  readonly all: HTMLElement | null;
  readonly interval: HTMLElement | null;
  readonly allBtns: NodeListOf<Element>;
  readonly budget: HTMLElement | null;

  constructor() {
    this.createIncome = document.getElementById('create-income');
    this.createExpense = document.getElementById('create-expense');
    this.today = document.getElementById('today');
    this.week = document.getElementById('week');
    this.month = document.getElementById('month');
    this.year = document.getElementById('year');
    this.all = document.getElementById('all');
    this.interval = document.getElementById('interval');
    this.allBtns = document.querySelectorAll(".table-btn");


    this.budget = document.getElementById('budget');

    if (this.today) {
      this.today.classList.add('active');
    }

    this.addEventListeners();
    this.performButtonClick(this.today);
    new Sidebars();
    this.dataInit().then();
  }

  private addEventListeners(): void {
    if (this.today) {
      this.today.onclick = (): void => {
        this.performButtonClick(this.today);
        const currentDate: Dayjs = dayjs();
        const todayStart: string = currentDate.startOf('day').format("YYYY-MM-DD");
        const todayEnd: string = currentDate.endOf('day').format("YYYY-MM-DD");
        this.buildTable(this, 'today', todayStart, todayEnd).then();
      };
    }

    if (this.week) {
      this.week.onclick = (): void => {
        this.performButtonClick(this.week);
        const currentDate: Dayjs = dayjs();
        const weekStart: string = currentDate.subtract(1, 'week').format("YYYY-MM-DD");
        const weekEnd: string = currentDate.format("YYYY-MM-DD");
        this.buildTable(this, 'week', weekStart, weekEnd).then();
      };
    }


    if (this.month) {
      this.month.onclick = (): void => {
        this.performButtonClick(this.month);
        const currentDate: Dayjs = dayjs();
        const monthStart: string = currentDate.startOf('month').format("YYYY-MM-DD");
        const monthEnd: string = currentDate.endOf('month').format("YYYY-MM-DD");
        this.buildTable(this, 'month', monthStart, monthEnd).then();
      };
    }

    if (this.year) {
      this.year.onclick = (): void => {
        this.performButtonClick(this.year);
        const currentDate: Dayjs = dayjs();
        const yearStart: string = currentDate.startOf('year').format("YYYY-MM-DD");
        const yearEnd: string = currentDate.endOf('year').format("YYYY-MM-DD");
        this.buildTable(this, 'year', yearStart, yearEnd).then();
      };
    }

    if (this.all) {
      this.all.onclick = (): void => {
        this.performButtonClick(this.all);
        this.buildTable(this, 'all').then();
      };
    }

    if (this.interval) {
      this.interval.onclick = (): void => {
        this.performButtonClick(this.interval);
        const from: HTMLInputElement | null = document.getElementById("dateFrom") as HTMLInputElement;
        const to: HTMLInputElement | null = document.getElementById("dateTo") as HTMLInputElement;

        if (from && to) {
          const dateFrom: string = dayjs(from.value, "DD.MM.YYYY").format("YYYY-MM-DD");
          const dateTo: string = dayjs(to.value, "DD.MM.YYYY").format("YYYY-MM-DD");

          this.buildTable(this, 'interval', dateFrom, dateTo).then();
        }
      }
    }

    if (this.createIncome) {
      this.createIncome.onclick = (): void => {
        location.href = '#/createOperation/income'
      };
    }

    if (this.createExpense) {
      this.createExpense.onclick = (): void => {
        location.href = '#/createOperation/expense'
      };
    }
  }

  private performButtonClick(btn: HTMLElement | null): void {
    for (let i: number = 0; i < this.allBtns.length; i++) {
      if (this.allBtns[i].classList.contains('active')) {
        this.allBtns[i].classList.remove("active");
      }
    }
    if (btn) {
      btn.classList.add('active');
    }
  }

  private async dataInit(): Promise<void> {
    await Sidebars.getBalance();
    await this.buildTable(this, 'today').then();
  }

  // строит таблицу операций на основе заданного периода и диапазона дат
  private async buildTable(that: TableIncomeAndExpense, period: string, from?: string, to?: string): Promise<void> {
    const operationsArray: OperationType[] = await GetOperation.getOperationsByPeriod(period, from, to);
    const operations: OperationType[] = Array.from(operationsArray);

    let tableRows: string = '';
    let num: number = 1;

    for (let i: number = 0; i < operations.length; i++) {
      const operation: OperationType = operations[i];
      let categoryName: string = '';

      if (operation.type === 'income') {
        categoryName = 'доход';
      }

      if (operation.type === 'expense') {
        categoryName = 'расход';
      }

      let date: string = dayjs(operation.date).format('DD.MM.YYYY');

      const tableHTML: string =
        `<div class="list">
          <div class="operation-title number">${num}</div>
          <div class="operation-title type">${categoryName}</div>
          <div class="operation-title class class-color" id="cat">${operation.category}</div>
          <div class="operation-title sum">${operation.amount} $</div>
          <div class="operation-title date">${date}</div>
          <div class="operation-title comment">${operation.comment}</div>
          <div class="operation-title btn-delete">
            <button class="delete" id="delete_${operation.id}">
              <svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.5 5.5C4.77614 5.5 5 5.72386 5 6V12C5 12.2761 4.77614 12.5 4.5 12.5C4.22386 12.5 4 12.2761 4 12V6C4 5.72386 4.22386 5.5 4.5 5.5Z" fill="black"/>
                <path d="M7 5.5C7.27614 5.5 7.5 5.72386 7.5 6V12C7.5 12.2761 7.27614 12.5 7 12.5C6.72386 12.5 6.5 12.2761 6.5 12V6C6.5 5.72386 6.72386 5.5 7 5.5Z" fill="black"/>
                <path d="M10 6C10 5.72386 9.77614 5.5 9.5 5.5C9.22386 5.5 9 5.72386 9 6V12C9 12.2761 9.22386 12.5 9.5 12.5C9.77614 12.5 10 12.2761 10 12V6Z" fill="black"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M13.5 3C13.5 3.55228 13.0523 4 12.5 4H12V13C12 14.1046 11.1046 15 10 15H4C2.89543 15 2 14.1046 2 13V4H1.5C0.947715 4 0.5 3.55228 0.5 3V2C0.5 1.44772 0.947715 1 1.5 1H5C5 0.447715 5.44772 0 6 0H8C8.55229 0 9 0.447715 9 1H12.5C13.0523 1 13.5 1.44772 13.5 2V3ZM3.11803 4L3 4.05902V13C3 13.5523 3.44772 14 4 14H10C10.5523 14 11 13.5523 11 13V4.05902L10.882 4H3.11803ZM1.5 3V2H12.5V3H1.5Z" fill="black"/>
              </svg>
            </button>
            <button class="edit" id="edit_${operation.id}">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path d="M12.1465 0.146447C12.3417 -0.0488155 12.6583 -0.0488155 12.8536 0.146447L15.8536 3.14645C16.0488 3.34171 16.0488 3.65829 15.8536 3.85355L5.85357 13.8536C5.80569 13.9014 5.74858 13.9391 5.68571 13.9642L0.68571 15.9642C0.500002 16.0385 0.287892 15.995 0.146461 15.8536C0.00502989 15.7121 -0.0385071 15.5 0.0357762 15.3143L2.03578 10.3143C2.06092 10.2514 2.09858 10.1943 2.14646 10.1464L12.1465 0.146447ZM11.2071 2.5L13.5 4.79289L14.7929 3.5L12.5 1.20711L11.2071 2.5ZM12.7929 5.5L10.5 3.20711L4.00001 9.70711V10H4.50001C4.77616 10 5.00001 10.2239 5.00001 10.5V11H5.50001C5.77616 11 6.00001 11.2239 6.00001 11.5V12H6.29291L12.7929 5.5ZM3.03167 10.6755L2.92614 10.781L1.39754 14.6025L5.21903 13.0739L5.32456 12.9683C5.13496 12.8973 5.00001 12.7144 5.00001 12.5V12H4.50001C4.22387 12 4.00001 11.7761 4.00001 11.5V11H3.50001C3.28561 11 3.10272 10.865 3.03167 10.6755Z" fill="black"/>
              </svg>
            </button>
          </div>
        </div>`;
      num++;
      tableRows += tableHTML;
    }
    if (this.budget) {
      this.budget.innerHTML = tableRows;
    }

    let classColor: HTMLCollectionOf<Element> = document.getElementsByClassName('class-color');

    for (let i: number = 0; i < classColor.length; i++) {
      let element: HTMLElement = classColor[i] as HTMLElement;
      let type: HTMLElement | null = element.previousSibling?.previousSibling as HTMLElement | null;


      if (type && type.textContent === 'доход') {
        type.style.color = 'green';
      }

      if (type && type.textContent === 'расход') {
        type.style.color = 'red';
      }
    }

    that.deleteOperation(that, operations, period, from, to).then();
    that.changeOperation(operations);
  }

  // обработчики событий для кнопки удаления операций
  private async deleteOperation(that: TableIncomeAndExpense, operations: OperationType[], period: string, from?: string, to?: string): Promise<void> {
    operations.forEach((operation: OperationType) => {
      let operationBtn: HTMLElement | null = document.getElementById('delete_' + operation.id);
      if (operationBtn) {
        operationBtn.onclick = () => popup(operation.id);
      }
    });

    function popup(id: number): void {
      const popup: HTMLElement | null = document.getElementById('popup');
      const agree: HTMLElement | null = document.getElementById('agree');
      const disagree: HTMLElement | null = document.getElementById('disagree');

      if (popup && agree && disagree) {
        popup.style.display = 'flex';

        agree.onclick = (): void => {
          deleteOperationAsync(id);
          popup.style.display = 'none';
        };

        disagree.onclick = (): string => popup.style.display = 'none';
      }
    }

    // запрос на удаление операции с указанным идентификатором
    const deleteOperationAsync = async (id: number): Promise<void> => {
      try {
        const result: DefaultResponseType = await CustomHttp.request(config.host + '/operations/' + id, 'DELETE');

        if (result) {
          if (!result.error) {
            await that.buildTable(that, period, from, to);
            new Sidebars();
            throw new Error(result.message);
          } else {
            await Sidebars.getBalance(); // запрос на баланс
            await that.buildTable(that, period, from, to);
          }
        }
      } catch (error) {
        return console.log(error);
      }
    }
  }

  // обработчики событий для кнопки изменения операции
  private changeOperation(operations: OperationType[]): void {
    operations.forEach((operation: OperationType) => {
      let operationBtn: HTMLElement | null = document.getElementById('edit_' + operation.id);

      if (operationBtn) {
        operationBtn.onclick = (): void => {
          location.href = '#/changeOperation?' + operation.id;
        };
      }
    })
  }
}