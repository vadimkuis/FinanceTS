import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Sidebars} from "./sidebars";
import {CategoriesResponseType} from "../types/categoty-response.type";
import {DefaultResponseType} from "../types/default-response.type";

export class CreateIncomeCategory {
  readonly title: HTMLElement | null;
  readonly agreeBtn: HTMLElement | null;
  readonly disagreeBtn: HTMLElement | null;
  readonly urlRoute: string;

  constructor() {
    this.title = document.getElementById('main-header');
    this.agreeBtn = document.getElementById('agree');
    this.disagreeBtn = document.getElementById('disagree');
    this.urlRoute = window.location.hash.split('?')[0];
    const that = this;

    this.dataInit().then((): void => {
      if (this.urlRoute === '#/createIncCat') {
        if (this.title && this.agreeBtn && this.disagreeBtn) {
          this.title.innerText = 'Создание категории доходов';
          this.agreeBtn.onclick = createInc;
          this.disagreeBtn.onclick = (): void => {
            location.href = '#/incomes'
          };
        }
      } else if (this.urlRoute === '#/createExpCat') {
        if (this.title && this.agreeBtn && this.disagreeBtn) {
          this.title.innerText = 'Создание категории расходов';
          this.agreeBtn.onclick = createExp;
          this.disagreeBtn.onclick = ():void => {
            location.href = '#/expenses'
          }
        }
      }
    });

    function createExp() {
      that.createCategory('/categories/expense').then(() => {
        location.href = '#/expenses';
      });
    }

    function createInc() {
      that.createCategory('/categories/income').then(() => {
        location.href = '#/incomes';
      });
    }

    new Sidebars();
  }

  async dataInit() {
    await Sidebars.getBalance();
  }

  // отправка запроса для создания новой категории
  async createCategory(urlRoute: string) : Promise<void> {
    const categoryNameInput: HTMLInputElement | null = document.getElementById('name') as HTMLInputElement | null;
    if (!categoryNameInput) return;

    const categoryName: string = categoryNameInput.value;

    try {
      const result: CategoriesResponseType | DefaultResponseType = await CustomHttp.request(config.host + urlRoute, 'POST', {
        title: categoryName
      });

      if (!result) {
        if ((result as DefaultResponseType).error !== undefined) {
          throw new Error((result as DefaultResponseType).message);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
}