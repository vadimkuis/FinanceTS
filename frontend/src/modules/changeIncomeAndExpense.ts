import {Sidebars} from "./sidebars";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import dayjs from 'dayjs';
import {GetCategory} from "../services/getCategory";
import {OperationType} from "../types/operation.type";
import {CategoriesResponseType} from "../types/categoty-response.type";

export class ChangeIncomeAndExpense {
  readonly titleHTML: HTMLElement | null;
  readonly disagree: HTMLElement | null;
  readonly id: string;

  constructor() {
    this.titleHTML = document.getElementById('main-header');
    this.disagree = document.getElementById('disagree');

    this.id = window.location.hash.split('?')[1]; // получение значения id из текущего URL-адреса

    if (this.titleHTML) {
      this.titleHTML.innerText = 'Редактирование дохода/расхода';
    }

    // перенаправление на страницу
    if (this.disagree) {
      this.disagree.onclick = () => {
        location.href = '#/operations'
      }
    }

    this.loadOperation(this, this.id).then();
    new Sidebars();
  }

  // загрузка информации об операции
  async loadOperation(that: ChangeIncomeAndExpense, id: string): Promise<void> {
    await Sidebars.getBalance(); // запрос на баланс
    const operation = await CustomHttp.request(config.host + '/operations/' + id); // запрос на сервер

    const type: HTMLInputElement | null = document.getElementById('typeName') as HTMLInputElement;
    const income: HTMLInputElement | null = document.getElementById('income') as HTMLInputElement;
    const expense: HTMLInputElement | null = document.getElementById('expense') as HTMLInputElement;
    const price: HTMLInputElement | null = document.getElementById('price') as HTMLInputElement;
    const date: HTMLInputElement | null = document.getElementById('date') as HTMLInputElement;
    const comment: HTMLInputElement | null = document.getElementById('comment') as HTMLInputElement;
    let categories: CategoriesResponseType[] = [];

    if (type && income && operation.type === 'income') {
      type.removeAttribute('selected');
      income.setAttribute('selected', 'selected');
    } else if (type && expense && operation.type === 'expense') {
      type.removeAttribute('selected');
      expense.setAttribute('selected', 'selected');
    }

    if (type) {
      type.value = operation.type;
      categories = await that.getCat(type.value, operation); // получение списка категорий
    }

    if (price) {
      price.value = operation.amount + ' $';
    }

    if (date) {
      date.value = dayjs(operation.date).format('DD.MM.YYYY');
    }

    if (comment) {
      comment.value = operation.comment;
    }

    that.changeOperation(that, operation, categories).then();
  }

  // обрабатывает изменения операции и обновляет соответствующие значения
  async changeOperation(that: ChangeIncomeAndExpense, operation: OperationType, categories: CategoriesResponseType[]) {
    const type: HTMLSelectElement | null = document.getElementById('type') as HTMLSelectElement;
    const category: HTMLSelectElement | null = document.getElementById('category') as HTMLSelectElement;
    const amount: HTMLInputElement | null = document.getElementById('price') as HTMLInputElement;
    const date: HTMLInputElement | null = document.getElementById('date') as HTMLInputElement;
    const comment: HTMLInputElement | null = document.getElementById('comment') as HTMLInputElement;
    const agree: HTMLElement | null = document.getElementById('agree');

    // выбор операции
    if (type) {
      type.onchange = async () => {
        if (type.value !== "Тип..") {
          operation.type = type.value;
          type.style.color = 'black';
          categories = await that.getCat(type.value, operation);
        }
      };
    }

    // const selectedCategory = categories.find((item: CategoriesResponseType) => item.title === category.value);
    // if (selectedCategory) {
    //   operation.categoryId = selectedCategory.id;
    // }

    if (category) {
      category.onchange = () => {
        const selectedCategory: CategoriesResponseType | undefined = categories.find((item: CategoriesResponseType) => item.title === category.value);
        if (selectedCategory) {
          operation.category = selectedCategory.title;
          category.style.color = 'black';
        }
      };
    }


    if (amount) {
      amount.onchange = () => {
        operation.amount = Number(amount.value.split(' ')[0]);
      };
    }

    if (date) {
      date.onchange = () => {
        operation.date = dayjs(date.value, 'YYYY-MM-DD').format('YYYY-MM-DD');
      };
    }

    if (comment) {
      comment.onchange = () => {
        operation.comment = comment.value;
      };
    }

    // отправка обновленной операции на сервер
    async function updateOperation(operation: OperationType): Promise<void> {
      try {
        const result = await CustomHttp.request(config.host + '/operations/' + operation.id, "PUT", {
          type: operation.type,
          category_id: operation.categoryId,
          amount: operation.amount,
          date: operation.date,
          comment: operation.comment
        })
        if (result) {
          location.href = '#/operations';
          if (!result) {
            new Sidebars();
            throw new Error(result.message);
          }
        }
      } catch (error) {
        return console.log(error);
      }
    }

    // перенаправление на страницу
    if (agree) {
      agree.onclick = () => {
        updateOperation(operation);
      }
    }
  }

  // получение списка категорий в зависимости от выбранного типа операции
  async getCat(type: string, operation: OperationType) {
    const category = document.getElementById('category');

    let options: HTMLOptionElement[] = [];

    const categories: CategoriesResponseType[] = await GetCategory.categories(type);

    if (category) {
      const items: HTMLOptionElement[] = Array.from(category.getElementsByTagName('option'));
      const filteredOptions: HTMLOptionElement[] = items.filter((item: HTMLOptionElement) => item.id.includes('option_'));
      filteredOptions.forEach((item: HTMLOptionElement) => item.remove());
    }

    const optionFirst = document.getElementById('option');
    if (optionFirst) {
      optionFirst.removeAttribute('selected');

    }

    categories.forEach((item: CategoriesResponseType) => {
      const option: HTMLOptionElement = document.createElement('option');
      if (item.title === operation.category) {
        option.setAttribute('selected', 'selected');
      }
      option.setAttribute('id', 'option_' + item.id);
      option.setAttribute('value', item.title);
      option.innerText = item.title;
      options.push(option);
    })

    if (category) {
      options.forEach((item: HTMLOptionElement): void => {
        category.appendChild(item);
      });
    }

    return categories;
  }
}