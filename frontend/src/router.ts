import {Form} from "./modules/form";
import {Main} from "./modules/main";
import {Auth} from "./services/auth";
import {TableIncomeAndExpense} from "./modules/tableIncomeAndExpense";
import {IncomeCategories} from "./modules/incomeCategories";
import {ChangeIncomeAndExpense} from "./modules/changeIncomeAndExpense";
import {CreateIncomeCategory} from "./modules/createIncomeCategory";
import {CreateIncomeAndExpense} from "./modules/createIncomeAndExpense";
import {ChangeIncomeCategory} from "./modules/changeIncomeCategory";
import {RouteType} from "./types/route.type";

export class Router {
  readonly contentElement: HTMLElement | null;
  readonly stylesElement: HTMLElement | null;
  readonly titleElement: HTMLElement | null;

  private routes: RouteType[];

  constructor() {
    this.contentElement = document.getElementById('content');
    this.stylesElement = document.getElementById('styles');
    this.titleElement = document.getElementById('title');

    this.routes = [
      {
        route: '#/',
        title: 'Авторизация',
        template: 'templates/login.html',
        styles: 'styles/login.css',
        load: () => {
          new Form('login');
        }
      },
      {
        route: '#/signup',
        title: 'Регистрация',
        template: 'templates/signup.html',
        styles: 'styles/login.css',
        load: () => {
          new Form('signup');
        }
      },
      {
        route: '#/main',
        title: 'Главная',
        template: 'templates/main.html',
        styles: 'styles/main.css',
        load: () => {
          new Main();
        }
      },
      {
        route: '#/incomes',
        title: 'Доходы',
        template: 'templates/incomeCategories.html',
        styles: 'styles/incomeCategories.css',
        load: () => {
          new IncomeCategories();
        }
      },
      {
        route: '#/createIncCat',
        title: 'Создание категории доходов',
        template: 'templates/createIncomeCategory.html',
        styles: 'styles/createIncomeCategory.css',
        load: () => {
          new CreateIncomeCategory();
        }
      },
      {
        route: '#/expenses',
        title: 'Расходы',
        template: 'templates/incomeCategories.html',
        styles: 'styles/incomeCategories.css',
        load: () => {
          new IncomeCategories();
        }
      },
      {
        route: '#/createExpCat',
        title: 'Создание категории расходов',
        template: 'templates/createIncomeCategory.html',
        styles: 'styles/createIncomeCategory.css',
        load: () => {
          new CreateIncomeCategory();
        }
      },
      {
        route: '#/changeIncCat',
        title: 'Редактирование категории доходов',
        template: 'templates/createIncomeCategory.html',
        styles: 'styles/createIncomeCategory.css',
        load: () => {
          new ChangeIncomeCategory();
        }
      },
      {
        route: '#/changeExpCat',
        title: 'Редактирование категории расходов',
        template: 'templates/createIncomeCategory.html',
        styles: 'styles/createIncomeCategory.css',
        load: () => {
          new ChangeIncomeCategory();
        }
      },
      {
        route: '#/operations',
        title: 'Доходы и Расходы',
        template: 'templates/tableIncomeAndExpense.html',
        styles: 'styles/tableIncomeAndExpense.css',
        load: () => {
          new TableIncomeAndExpense();
        }
      },
      {
        route: '#/createOperation/income',
        title: 'Создание дохода',
        template: 'templates/incomeAndExpense.html',
        styles: 'styles/incomeAndExpense.css',
        load: () => {
          new CreateIncomeAndExpense('income');
        }
      },
      {
        route: '#/createOperation/expense',
        title: 'Создание расхода',
        template: 'templates/incomeAndExpense.html',
        styles: 'styles/incomeAndExpense.css',
        load: () => {
          new CreateIncomeAndExpense('expense');
        }
      },
      {
        route: '#/changeOperation',
        title: 'Редактирование дохода/расхода',
        template: 'templates/incomeAndExpense.html',
        styles: 'styles/incomeAndExpense.css',
        load: () => {
          new ChangeIncomeAndExpense();
        }
      },
    ]
  }

  public async openRoute(): Promise<void> {
    const urlRoute: string = window.location.hash.split('?')[0];

    if (urlRoute === '#/logout') {
      const result: boolean = await Auth.logout();
      if (result) {
        window.location.href = '#/';
        return;
      }
    }

    const newRoute: RouteType | undefined = this.routes.find((item: RouteType) => {
      return item.route === urlRoute;
    })

    if (!newRoute) {
      window.location.href = '#/';
      return;
    }

    if (!this.contentElement || !this.stylesElement || !this.titleElement) {
      if (urlRoute === '#/') {
        return;
      } else {
        window.location.href = '#/';
        return;
      }
    }

    this.contentElement.innerHTML = await fetch(newRoute.template).then(response => response.text());
    this.stylesElement.setAttribute('href', newRoute.styles);
    this.titleElement.innerText = newRoute.title;

    newRoute.load();
  }
}