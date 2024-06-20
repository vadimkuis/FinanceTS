import {GetCategory} from "../services/getCategory";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Sidebars} from "./sidebars";
import {CategoriesResponseType} from "../types/categoty-response.type";
import {DefaultResponseType} from "../types/default-response.type";

export class ChangeIncomeCategory {
  readonly titleHTML: HTMLElement | null;
  readonly urlRoute: string;
  readonly categoryId: number;
  readonly agreeBtn: HTMLElement | null;
  readonly disagreeBtn: HTMLElement | null;

  constructor() {
    this.titleHTML = document.getElementById('main-header');
    this.urlRoute = window.location.hash.split('?')[0];
    this.categoryId = Number(window.location.hash.split('?')[1]);
    this.agreeBtn = document.getElementById('agree');
    this.disagreeBtn = document.getElementById('disagree');
    const that = this;

    if (this.urlRoute === '#/changeIncCat') {
      this.loadCategory('income', this.categoryId).then();
      if (this.titleHTML) {
        this.titleHTML.innerText = 'Редактирование категории доходов';
      }

      if (this.agreeBtn) {
        this.agreeBtn.onclick = changeInc;
      }

      if (this.disagreeBtn) {
        this.disagreeBtn.onclick = (): void => {location.href = '#/incomes'}
      }
    }

    if (this.urlRoute === '#/changeExpCat') {
      this.loadCategory('expense', this.categoryId).then();
      if (this.titleHTML) {
        this.titleHTML.innerText = 'Редактирование категории расходов';
      }

      if (this.agreeBtn) {
        this.agreeBtn.onclick = changeExp;
      }

      if (this.disagreeBtn) {
        this.disagreeBtn.onclick = (): void => {location.href = '#/expenses'}
      }
    }

    function changeExp() {
      that.changeCategory('/categories/expense/' + that.categoryId).then((): void => {
        location.href = '#/expenses'
      });
    }

    function changeInc() {
      that.changeCategory('/categories/income/' +  that.categoryId).then((): void => {
        location.href = '#/incomes'
      });
    }

    new Sidebars();
  }

  // загрузка категорию определенного типа
  async loadCategory(typeCategory: string, categoryId: number): Promise<void> {
    await Sidebars.getBalance();
    const categoryName: HTMLInputElement | null = document.getElementById('name') as HTMLInputElement;
    if (categoryName) {
      const categories: CategoriesResponseType[] = await GetCategory.categories(typeCategory);
      const category: CategoriesResponseType | undefined = categories.find((item: CategoriesResponseType) => item.id === categoryId);
      if (category) {
        categoryName.value = category.title;
      }
    }
  }

  // обновление имени категории
  async changeCategory(urlRoute: string): Promise<void> {
    const categoryName: HTMLInputElement | null = document.getElementById('name') as HTMLInputElement;

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
      return console.log(error);
    }
  }
}