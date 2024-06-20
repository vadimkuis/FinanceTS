import {Sidebars} from "./sidebars";
import {GetCategory} from "../services/getCategory";
import {Popup} from "./popap";
import {CategoriesResponseType} from "../types/categoty-response.type";

export class IncomeCategories {
  private title: HTMLElement | null;
  private category: HTMLElement | null;
  readonly urlRoute: string;

  constructor() {
    this.title = document.getElementById('main-header');
    this.category = document.getElementById('category');
    this.urlRoute = window.location.hash.split('?')[0];

    if (this.urlRoute === '#/incomes') {
      (this.title as HTMLElement).innerText = 'Доходы';
      this.createCategoriesTable('income').then(() => new Popup('income'));
    }

    if (this.urlRoute === '#/expenses') {
      (this.title as HTMLElement).innerText = 'Расходы';
      this.createCategoriesTable('expense').then(() => new Popup('expense'));
    }

    new Sidebars();
  }

  // создание категорий доходов или расходов в зависимости от переданного аргумента categories
  private async createCategoriesTable(categories: string): Promise<void> {
    await Sidebars.getBalance(); // запрос на баланс
    let categoriesList: CategoriesResponseType[] = await GetCategory.categories(categories);
    let tableCat: string = '';
    const createCat: string = `<div class="category-item add-category-item" id="add-category-item">+</div>`

    categoriesList.forEach((a: CategoriesResponseType) => {
      const categoryHTML: string =
        `<div class="category-item" id="categoryItem">
         <div class="category-item-title" id="categoryItemTitle">${a.title}</div>
           <div class="category-item-action">
             <button class="btn edit-category">Редактировать</button>
             <button class="btn delete-category">Удалить</button>
           </div>
         </div>`;
      tableCat += categoryHTML;
    });

    (this.category as HTMLElement).innerHTML = tableCat + createCat;
    this.changePage(categories);
  }

  private changePage(categories: string): void {
    const createBtn: HTMLElement | null = document.getElementById('add-category-item');

    if (categories === 'income') {
      if (createBtn) {
        createBtn.onclick = (): string => location.href = "#/createIncCat";
      }
    }

    if (categories === 'expense') {
      if (createBtn) {
        createBtn.onclick = (): string => location.href = "#/createExpCat";
      }
    }
  }
}