import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Auth} from "../services/auth";
import {FormFieldType} from "../types/form-field.type";
import {SignupResponseType} from "../types/signup-response.type";
import {DefaultResponseType} from "../types/default-response.type";
import {LoginResponseType} from "../types/login-response.type";

export class Form {
  private agreeElement: HTMLInputElement | null;
  readonly processElement: HTMLElement | null;
  readonly page: 'signup' | 'login';
  private fields: FormFieldType[] = [];

  constructor(page: 'signup' | 'login') {
    this.agreeElement = null;
    this.processElement = null;
    this.page = page;

    const accessToken: string | null = localStorage.getItem(Auth.accessTokenKey);

    if (accessToken) {
      location.href = '/#/main';
      return;
    }

    this.fields = [
      {
        name: "email",
        id: "email",
        element: null,
        regex: /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\.[A-Za-z]{2,4}$/,
        valid: false,
      },
      {
        name: "password",
        id: "password",
        element: null,
        regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,}$/,
        valid: false,
      },
    ];

    if (this.page === 'signup') {
      this.fields.unshift({
        name: "name",
        id: "name",
        element: null,
        regex: /^[A-ЯЁA-Z][а-яёa-z]+\s[A-ЯЁA-Z][а-яёa-z]+$/,
        valid: false,
      });

      this.fields.push({
        name: "passwordRepeat",
        id: "password-repeat",
        element: null,
        regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,}$/,
        valid: false,
      });
    }

    const that: Form = this;

    this.fields.forEach((item: FormFieldType) => {
      item.element = document.getElementById(item.id) as HTMLInputElement;
      if (item.element) {
        item.element.onchange = function () {
          that.validateField.call(that, item, <HTMLInputElement>this);
        };
      }
    });

    this.processElement = document.getElementById('process');
    if (this.processElement) {
      this.processElement.onclick = function () {
        that.processForm();
      }
    }

    // if (this.page === 'login') {
    //   this.agreeElement = document.getElementById('remember') as HTMLInputElement;
    //   if ( this.agreeElement) {
    //     this.agreeElement.onchange = function () {
    //       that.validateForm();
    //     }
    //   }
    // }
  }

  // проверка валидности полей
  private validateField(field: FormFieldType, element: HTMLInputElement): void {
    const parentNode: HTMLElement = element.parentNode as HTMLElement;
    const errorElement: HTMLElement | null = document.getElementById(`${element.id}-error`);

    if (element.parentNode) {
      if (!element.value || !element.value.match(field.regex)) {
        element.style.borderColor = 'red';
        parentNode.style.marginBottom = '0';
        field.valid = false;
      } else {
        element.removeAttribute('style');
        parentNode.style.marginBottom = '10px';
        field.valid = true;
      }

      if (errorElement) {
        errorElement.style.display = field.valid ? 'none' : 'block';
      }
    }

    if (this.page === 'signup' && field.name === 'passwordRepeat') {
      const passwordField: FormFieldType | undefined = this.fields.find((item: FormFieldType) => item.name === 'password');

      if (passwordField !== undefined) {
        const passwordElement: HTMLInputElement | null = passwordField.element;
        const passwordValue: string | undefined = passwordElement?.value;

        if (passwordValue && element.value !== passwordValue) {
          element.style.borderColor = 'red';
          if (parentNode !== null) {
            parentNode.style.marginBottom = '0';
          }
          field.valid = false;
          if (errorElement !== null) {
            errorElement.style.display = 'block';
          }
        }
      }
    }

    this.validateForm();
  }

  // проверка валидности формы
  private validateForm(): boolean {
    const validForm: boolean = this.fields.every((item: FormFieldType) => item.valid);
    // const isValid: boolean = this.agreeElement ? this.agreeElement.checked && validForm : validForm;
    if (this.processElement) {
      if (validForm) {
        this.processElement.removeAttribute('disabled');
      } else {
        this.processElement.setAttribute('disabled', 'disabled');
      }
    }

    return validForm;
  }

  // обработка формы при отправке
  private async processForm(): Promise<void> {
    if (this.validateForm()) {
      const email: string = this.fields.find((item: FormFieldType) => item.name === 'email')?.element?.value ?? '';
      const password: string = this.fields.find((item: FormFieldType) => item.name === 'password')?.element?.value ?? '';

      if (this.page === 'signup') {
        const name: string = (this.fields.find((item: FormFieldType) => item.name === 'name')?.element?.value.split(' ')[0]) ?? '';
        const lastName: string = (this.fields.find((item: FormFieldType) => item.name === 'name')?.element?.value.split(' ')[1]) ?? '';
        const passwordRepeat: string = this.fields.find((item: FormFieldType) => item.name === 'passwordRepeat')?.element?.value ?? '';


        if (password !== passwordRepeat) {
          const passwordRepeatField: FormFieldType | undefined = this.fields.find((item: FormFieldType) => item.name === 'passwordRepeat');
          if (passwordRepeatField) {
            const passwordRepeatElement: HTMLInputElement | null = passwordRepeatField.element;
            if (passwordRepeatElement) {
              passwordRepeatElement.style.borderColor = 'red';
              const parentNode: HTMLElement = passwordRepeatElement.parentNode as HTMLElement;
              if (parentNode) {
                parentNode.style.marginBottom = '0';
              }
              passwordRepeatField.valid = false;
              const errorElement: HTMLElement | null = document.getElementById(`${passwordRepeatElement.id}-error`);
              if (errorElement) {
                errorElement.style.display = 'block';
              }
              return;
            }
          }
        }

        try {
          const result: SignupResponseType | DefaultResponseType = await CustomHttp.request(config.host + '/signup', 'POST', {
            name: name,
            lastName: lastName,
            email: email,
            password: password,
            passwordRepeat: passwordRepeat,
          });

          if (result) {
            if (result.error || !result.user) {
              throw new Error(result.message);
            }
          }
        } catch (error) {
          console.log(error);
          return;
        }
      }

      this.agreeElement = document.getElementById('remember') as HTMLInputElement;
      let rememberMe: boolean = false;
      if (this.page === 'login' && this.agreeElement) {
        rememberMe = this.agreeElement.checked;
      }

      try {
        const result: LoginResponseType | DefaultResponseType = await CustomHttp.request(config.host + '/login', 'POST', {
          email: email,
          password: password,
          rememberMe: rememberMe,
        });

        if (result) {
          if (result.error || !result.tokens.accessToken || !result.tokens.refreshToken || !result.user.name || !result.user.lastName || !result.user.id) {
            throw new Error(result.message);
          }

          Auth.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
          Auth.setUserInfo({
            name: result.user.name,
            lastName: result.user.lastName,
            userId: result.user.id,
            email: email,
          });

          location.href = '/#/main';
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
}