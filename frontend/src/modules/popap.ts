import {GetCategory} from "../services/getCategory";
import {IncomeCategories} from "./incomeCategories";
import {GetOperation} from "../services/getOperation";
import {CustomHttp} from "../services/custom-http";
import {Sidebars} from "./sidebars";
import config from "../../config/config";
import {CategoriesResponseType} from "../types/categoty-response.type";
import {DefaultResponseType} from "../types/default-response.type";
import {OperationType} from "../types/operation.type";

export class Popup {
  constructor(category: string) {
    const that = this;
    this.openPopup(that, category).then();

    new Sidebars();
  }

  // открывает попап окно при нажатии на кнопку delete-category
  private async openPopup(item: Popup, categories: string): Promise<void> {
    const urlRoute: string = window.location.hash.split('?')[0];
    const popup: HTMLElement | null = document.getElementById('popup');
    const agree: HTMLElement | null = document.getElementById('agree');
    const disagree: HTMLElement | null = document.getElementById('disagree');
    const openButtons: HTMLCollectionOf<HTMLButtonElement> = document.getElementsByClassName('delete-category') as HTMLCollectionOf<HTMLButtonElement>;
    const changeButtons: HTMLCollectionOf<HTMLButtonElement> = document.getElementsByClassName('edit-category') as HTMLCollectionOf<HTMLButtonElement>;
    let categoryId: number;
    let categoryTitle: string;
    let categoriesList: CategoriesResponseType[] = await GetCategory.categories(categories);

    function closePopup(): void {
      if (popup) {
        popup.style.display = 'none';
      }
    }

    for (let i: number = 0; i < openButtons.length; i++) {
      openButtons[i].onclick = function (): void {
        if (popup && categoryId && categoryTitle) {
          popup.style.display = 'flex';
          categoryId = categoriesList[i].id;
          categoryTitle = categoriesList[i].title;
        }


        if (urlRoute === '#/incomes') {
          if (agree) {
            agree.onclick = (): void => {
              item.deleteOperations(categoryTitle).then(() => deleteInc());
            }
          }
        }

        if (urlRoute === '#/expenses') {
          if (agree) {
            agree.onclick = (): void => {
              item.deleteOperations(categoryTitle).then(() => deleteExp());
            };
          }
        }
      }
    }

    for (let i: number = 0; i < changeButtons.length; i++) {
      changeButtons[i].onclick = function (): void {
        categoryId = categoriesList[i].id;
        categoryTitle = categoriesList[i].title;

        if (urlRoute === '#/incomes') {
          location.href = '#/changeIncCat?' + categoryId;
        }
        if (urlRoute === '#/expenses') {
          location.href = '#/changeExpCat?' + categoryId;
        }
      };
    }

    if (disagree) {
      disagree.addEventListener("click", closePopup);
    }

    function deleteExp(): void {
      item.deleteCategory('/categories/expense/' + categoryId)
        .then(() => closePopup())
        .then(() => new IncomeCategories())
    }

    function deleteInc() {
      item.deleteCategory('/categories/income/' + categoryId)
        .then(() => closePopup())
        .then(() => new IncomeCategories())
    }
  }

  // запрос на удаление категории
  async deleteCategory(urlRoute: string): Promise<void> {
    try {
      const result = await CustomHttp.request(config.host + urlRoute, 'DELETE');
      if (result) {
        if (!result) {
          throw new Error(result.message);
        }
      }
    } catch (error) {
      return console.log(error);
    }
  }

  // удаление всех операций, связанных с заданной категорией
  async deleteOperations(categoryTitle: string): Promise<void> {
    const operations: OperationType[] = await GetOperation.getOperationsByPeriod('all');
    const deleteCategory: OperationType[] = operations.filter(operation => operation.category === categoryTitle);

    deleteCategory.forEach((item: OperationType) => deleteOperation(item.id));

    async function deleteOperation(id: number): Promise<void> {
      try {
        const result: DefaultResponseType = await CustomHttp.request(config.host + '/operations/' + id, 'DELETE');
        if (result) {
          if (!result.error) {
            throw new Error(result.message);
          }
        }
      } catch (error) {
        return console.log(error);
      }
    }
  }
}