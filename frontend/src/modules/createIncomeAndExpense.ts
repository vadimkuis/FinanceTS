import {Sidebars} from "./sidebars";
import {GetCategory} from "../services/getCategory";
import dayjs, {Dayjs} from 'dayjs';
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {CreateOperationTableType} from "../types/create-operation-table.type";
import {DefaultResponseType} from "../types/default-response.type";
import {CategoriesResponseType} from "../types/categoty-response.type";

export class CreateIncomeAndExpense {
  readonly titleHTML: HTMLElement | null;
  readonly disagree: HTMLElement | null;
  readonly typeSelect: HTMLSelectElement | null;
  readonly incomeOption: HTMLOptionElement | null;
  readonly expenseOption: HTMLOptionElement | null;
  private categories: CategoriesResponseType[] = [];

  constructor(category: string) {
    this.titleHTML = document.getElementById('main-header');
    this.disagree = document.getElementById('disagree');
    this.incomeOption = document.getElementById('income') as HTMLOptionElement | null;
    this.expenseOption = document.getElementById('expense') as HTMLOptionElement | null;
    this.typeSelect = document.getElementById('type') as HTMLSelectElement | null;

    if (category === 'income') {
      if (this.incomeOption) {
        this.incomeOption.selected = true;
      }
    } else if (category === 'expense') {
      if (this.expenseOption) {
        this.expenseOption.selected = true;
      }
    }

    if (this.typeSelect) {
      this.typeSelect.disabled = true;
    }

    if (this.titleHTML) {
      this.titleHTML.innerText = document.title;
    }

    // перенаправление на страницу
    if (this.disagree) {
      this.disagree.onclick = (): void => {
        location.href = '#/operations'
      }
    }

    this.createOperation().then();
    this.dataInit().then();
    new Sidebars();
  }

  private async dataInit(): Promise<void> {
    await Sidebars.getBalance();
    if (this.typeSelect) {
      this.categories = await this.getCategories(this.typeSelect.value);
    }
  }

  // получение списка категорий в зависимости от выбранного типа операции
  private async getCategories(type: string): Promise<CategoriesResponseType[]> {
    const options: HTMLOptionElement[] = [];
    const categories: CategoriesResponseType[] = await GetCategory.categories(type);
    const category: HTMLElement | null = document.getElementById('category');

    if (category) {
      const items: HTMLOptionElement[] = Array.from(category.getElementsByTagName('option'));
      const filteredOptions: HTMLOptionElement[] = items.filter((item: HTMLOptionElement) => item.id.includes('option_'));
      filteredOptions.forEach((item: HTMLOptionElement) => item.remove());
    }

    categories.forEach((item: CategoriesResponseType): void => {
      const option: HTMLOptionElement = document.createElement('option');
      option.setAttribute('id', 'option_' + item.id);
      option.setAttribute('value', item.title);
      option.innerText = item.title;
      options.push(option);
    });

    if (category) {
      options.forEach((item: HTMLOptionElement): void => {
        category.appendChild(item);
      });
    }

    return categories;
  }

  // создание информации об операции
  async createOperation(): Promise<void> {
    let operation = {
      type: '',
      categoryId: 0,
      amount: 0,
      date: '',
      comment: '',
    };

    const category: HTMLSelectElement | null = document.getElementById('category') as HTMLSelectElement | null;
    const amount: HTMLInputElement | null = document.getElementById('price') as HTMLInputElement | null;
    const date: HTMLInputElement | null = document.getElementById('date') as HTMLInputElement | null;
    const comment: HTMLInputElement | null = document.getElementById('comment') as HTMLInputElement | null;
    const agree: HTMLButtonElement | null = document.getElementById('agree') as HTMLButtonElement | null;

    if (agree) {
      agree.setAttribute('disabled', 'disabled');
    }

    // выбор категорий в зависимости от типа
    if (this.typeSelect) {
      operation.type = this.typeSelect.value;
      this.typeSelect.style.color = 'black';
    }

    if (category) {
      category.onchange = (): void => {
        const selectedCategory: CategoriesResponseType | undefined = this.categories.find((item: CategoriesResponseType) => item.title === category.value);
        if (selectedCategory) {
          operation.categoryId = selectedCategory.id;
          category.style.color = 'black';
          validation();
        }
      };
    }

    if (amount) {
      amount.oninput = (): void => {
        const inputValue: string = amount.value;
        const cleanedValue: string = inputValue.replace(/[^0-9]/g, '');
        amount.value = cleanedValue;
        operation.amount = Number(cleanedValue);
        validation();
      };
    }

    if (date) {
      date.oninput = (): void => {
        const inputValue: string = date.value;
        const parsedDate: Dayjs = dayjs(inputValue, 'YYYY-MM-DD');
        if (parsedDate.isValid()) {
          operation.date = parsedDate.format('YYYY-MM-DD');
        } else {
          operation.date = '';
        }
        validation();
      };
    }

    if (comment) {
      comment.oninput = (): void => {
        const inputValue: string = comment.value;
        const cleanedValue: string = inputValue.replace(/[^a-zA-Zа-яА-ЯУЁё0-9,.!?/ ]/g, ''); // Оставить только буквенно-цифровые символы и знаки препинания
        comment.value = cleanedValue;
        operation.comment = cleanedValue;
        validation();
      };
    }

    function validation(): void {
      if (agree) {
        agree.disabled = !(operation.type && operation.categoryId && operation.amount && operation.date && operation.comment);
      }
    }

    // отправка созданной операции на сервер
    async function sendOperationToServer(operation: CreateOperationTableType): Promise<void> {
      try {
        const result: CreateOperationTableType | DefaultResponseType = await CustomHttp.request(config.host + '/operations', "POST", {
          type: operation.type,
          category_id: operation.categoryId,
          amount: operation.amount,
          date: operation.date,
          comment: operation.comment
        });
        if (result) {
          location.href = '#/operations';
          if ((result as DefaultResponseType).error !== undefined) {
            new Sidebars();
            throw new Error((result as DefaultResponseType).message);
          }
        }
      } catch (error) {
        return console.log(error);
      }
    }

    // перенаправление на страницу
    if (agree) {
      agree.onclick = (): void => {
        sendOperationToServer(operation);
      }
    }
  }
}