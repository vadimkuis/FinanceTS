import {Auth} from "../services/auth";
import config from "../../config/config";
import {CustomHttp} from "../services/custom-http";
import {UserInfoType} from "../types/user-info.type";
import {BalanceResponseType} from "../types/balance-response.type";

export class Sidebars {
  readonly mainBtn: HTMLElement | null;
  readonly allBtn: HTMLCollectionOf<Element>;
  readonly dropdownToggle: HTMLElement | null;
  readonly dropdownBtn: HTMLElement | null;
  readonly dropdownMenu: HTMLElement | null;
  readonly incomesBtn: HTMLElement | null;
  readonly expenseBtn: HTMLElement | null;
  readonly incExpBtn: HTMLElement | null;
  readonly profileNameElement: HTMLElement | null;
  readonly imageUser: HTMLElement | null;
  readonly logout: HTMLElement | null;
  readonly urlRoute: string;
  readonly userInfo: UserInfoType | null;
  readonly accessToken: string | null;
  readonly routeButtonMap: { [key: string]: HTMLElement | null };

  constructor() {
    this.mainBtn = document.getElementById('mainBtn');
    this.allBtn = document.getElementsByClassName('sidebar-link');
    this.dropdownToggle = document.getElementById('dropdown-toggle');
    this.dropdownBtn = document.getElementById('dropdown-button');
    this.dropdownMenu = document.getElementById('dropdown-menu');
    this.incomesBtn = document.getElementById('catIncomesBtn');
    this.expenseBtn = document.getElementById('catExpenseBtn');
    this.incExpBtn = document.getElementById('incomesExpenseBtn');
    this.profileNameElement = document.getElementById('userName');
    this.imageUser = document.getElementById('user-image');
    this.logout = document.getElementById('logout');
    this.urlRoute = window.location.hash.split('?')[0];

    this.userInfo = Auth.getUserInfo();
    this.accessToken = localStorage.getItem(Auth.accessTokenKey);

    if (this.userInfo && this.accessToken && this.profileNameElement) {
      this.profileNameElement.innerText = `${this.userInfo.name} ${this.userInfo.lastName}`;
    }

    if (this.dropdownMenu && this.dropdownBtn) {
      this.dropdownMenu.style.display = 'none';
      this.dropdownBtn.style.transform = 'rotate(-90deg)';
    }

    if (this.logout) {
      this.logout.style.display = 'none';
    }

    // соответствие между URL-путями и кнопками на странице
    this.routeButtonMap = {
      "#/main": this.mainBtn,
      "#/operations": this.incExpBtn,
      "#/incomes": this.incomesBtn,
      "#/expenses": this.expenseBtn,
      "#/createOperation/income": this.incExpBtn,
      "#/createIncCat": this.incomesBtn,
      "#/createExpCat": this.expenseBtn,
      "#/changeIncCat": this.incomesBtn,
      "#/changeExpCat": this.expenseBtn,
    };

    // проверка URL-пути
    if (this.routeButtonMap[this.urlRoute]) {
      this.setActiveButton(this.routeButtonMap[this.urlRoute]);
    }

    if (this.mainBtn) {
      this.mainBtn.onclick = (): void => {
        location.href = '#/main';
      };
    }

    if (this.incExpBtn) {
      this.incExpBtn.onclick = (): void => {
        location.href = '#/operations';
      };
    }

    if (this.incomesBtn) {
      this.incomesBtn.onclick = (): void => {
        location.href = '#/incomes';
      };
    }

    if (this.expenseBtn) {
      this.expenseBtn.onclick = (): void => {
        location.href = '#/expenses';
      };
    }

    if (this.dropdownToggle) {
      this.dropdownToggle.onclick = (): void => {
        this.toggleDropdownMenu();
      }
    }

    if (this.imageUser) {
      this.imageUser.onclick = (): void => {
        if (this.logout) {
          if (this.logout.style.display !== 'flex') {
            this.logout.style.display = 'flex'
          } else {
            this.logout.style.display = 'none'
          }
        }
      }
    }

    if (this.logout) {
      this.logout.onclick = (): void => {
        location.href = '#/logout'
      }
    }
  }

  // функция устанавливает класс "active" переданной кнопке и удаляет этот класс у всех остальных кнопок
  private setActiveButton(btn: HTMLElement | null): void {
    for (let i: number = 0; i < this.allBtn.length; i++) {
      if (this.allBtn[i].classList.contains('active')) {
        this.allBtn[i].classList.remove("active");
      }
    }

    if (btn) {
      btn.classList.add('active');
    }

    if (this.dropdownToggle && this.dropdownMenu && this.dropdownBtn) {
      if (btn === this.incomesBtn || btn === this.expenseBtn) {
        this.dropdownToggle.classList.add('active');
        this.dropdownMenu.style.display = 'flex';
        this.dropdownMenu.style.flexDirection = 'column';
        this.dropdownBtn.style.transform = 'rotate(0deg)';
      }
    }
  }

  private toggleDropdownMenu(): void {
    if (this.dropdownToggle && this.dropdownMenu && this.dropdownBtn) {
      if (this.dropdownToggle.classList.contains('active')) {
        this.dropdownToggle.classList.remove('active');
        this.dropdownMenu.style.display = 'none';
        this.dropdownBtn.style.transform = 'rotate(-90deg)';
      } else {
        this.dropdownToggle.classList.add('active');
        this.dropdownMenu.style.display = 'flex';
        this.dropdownMenu.style.flexDirection = 'column';
        this.dropdownBtn.style.transform = 'rotate(0deg)';
      }
    }
  }

  // запрос баланса
  public static async getBalance(): Promise<void> {
    const balanceProfile: HTMLElement | null = document.getElementById('balance');
    try {
      const response: BalanceResponseType = await CustomHttp.request(config.host + '/balance');
      if (response) {
        if (balanceProfile) {
          balanceProfile.innerText = response.balance.toString();
        }
        // return response;
      } else {
        if (balanceProfile) {
          balanceProfile.innerText = '0';
        }
        // return 0;
      }
    } catch (error) {
      console.log(error);
    }
  }
}