import {Sidebars} from "./sidebars";
import {Chart} from "chart.js/auto";
import {Filters} from "../services/fillter";
import dayjs, {Dayjs} from "dayjs";
import {ChartConfigType} from "../types/chart-config.type";

export class Main {
  readonly today: HTMLElement | null;
  readonly week: HTMLElement | null;
  readonly month: HTMLElement | null;
  readonly year: HTMLElement | null;
  readonly all: HTMLElement | null;
  readonly interval: HTMLElement | null;
  readonly allBtns: NodeListOf<Element>;

  constructor() {
    this.today = document.getElementById("today");
    this.week = document.getElementById("week");
    this.month = document.getElementById("month");
    this.year = document.getElementById("year");
    this.all = document.getElementById("all");
    this.interval = document.getElementById("interval");
    this.allBtns = document.querySelectorAll(".table-btn");

    this.addEventListeners();
    this.setActiveButton(this.today);
    this.performButtonClick("today").then();
    new Sidebars;
  }

  // вызов соответствующего метод
  private addEventListeners(): void {
    if (this.today) {
      this.today.onclick = async (): Promise<void> => {
        const currentDate: Dayjs = dayjs();
        const todayStart: string = currentDate.startOf('day').format("YYYY-MM-DD");
        const todayEnd: string = currentDate.endOf('day').format("YYYY-MM-DD");
        await this.performButtonClick("today", todayStart, todayEnd);
      };
    }

    if (this.week) {
      this.week.onclick = async (): Promise<void> => {
        const currentDate: Dayjs = dayjs();
        const weekStart: string = currentDate.subtract(1, 'week').format("YYYY-MM-DD");
        const weekEnd: string = currentDate.format("YYYY-MM-DD");
        await this.performButtonClick("week", weekStart, weekEnd);
      };
    }

    if (this.month) {
      this.month.onclick = async (): Promise<void> => {
        this.setActiveButton(this.month);
        const currentDate: Dayjs = dayjs();
        const monthStart: string = currentDate.startOf('month').format("YYYY-MM-DD");
        const monthEnd: string = currentDate.endOf('month').format("YYYY-MM-DD");
        await this.performButtonClick("month", monthStart, monthEnd);
      };
    }

    if (this.year) {
      this.year.onclick = async (): Promise<void> => {
        this.setActiveButton(this.year);
        const currentDate: Dayjs = dayjs();
        const yearStart: string = currentDate.startOf('year').format("YYYY-MM-DD");
        const yearEnd: string = currentDate.endOf('year').format("YYYY-MM-DD");
        await this.performButtonClick("year", yearStart, yearEnd);
      };
    }

    if (this.all) {
      this.all.onclick = async (): Promise<void> => {
        this.setActiveButton(this.all);
        await this.performButtonClick("all");
      };
    }

    if (this.interval) {
      this.interval.onclick = async (): Promise<void> => {
        this.setActiveButton(this.interval);

        const from: HTMLInputElement | null = document.getElementById("dateFrom") as HTMLInputElement;
        const to: HTMLInputElement | null = document.getElementById("dateTo") as HTMLInputElement;

        if (from && to) {
          const dateFrom: string = dayjs(from.value, "DD.MM.YYYY").format("YYYY-MM-DD");
          const dateTo: string = dayjs(to.value, "DD.MM.YYYY").format("YYYY-MM-DD");

          await this.performButtonClick("interval", dateFrom, dateTo);
        }
      }
    }
  }

  private setActiveButton(btn: HTMLElement | null): void {
    this.allBtns.forEach((button) => button.classList.remove("active"));
    if (btn) {
      btn.classList.add("active");
    }
  }

  // построение диаграмм в зависимости от периода
  private async performButtonClick(period: string, from?: string, to?: string): Promise<void> {
    await Sidebars.getBalance(); // запрос на баланс
    const [incomesCategories, incomesData, expenseCategories, expensesData]: [string[], number[], string[], number[]] = await new Filters(period, from, to).getData();
    const incomes: HTMLElement | null = document.getElementById("categoryIncomes");
    const expenses: HTMLElement | null = document.getElementById("categoryExpense");

    if (incomes && expenses) {
      incomes.innerHTML = `<h2 class="charts-title">Доходы</h2>`;
      incomes.appendChild(createChart("catIncomes", incomesCategories, incomesData));
      expenses.innerHTML = `<h2 class="charts-title">Расходы</h2>`;
      expenses.appendChild(createChart("catExpenses", expenseCategories, expensesData));
    }

    function createChart(id: string, categories: string[], data: number[]): HTMLCanvasElement {
      const canvas: HTMLCanvasElement = document.createElement("canvas");
      const colorPalette: string[] = ["#DC3545", "#FD7E14", "#FFC107", "#20C997", "#0D6EFD"];
      const backgroundColor: string[] = colorPalette.concat(generateRandomColors(categories.length - colorPalette.length));

      const config: ChartConfigType = {
        type: "pie",
        data: {
          labels: categories,
          datasets: [
            {
              data: data,
              label: "$",
              borderWidth: 1,
              backgroundColor: backgroundColor,
            },
          ],
        },
        options: {
          devicePixelRatio: 4,
          plugins: {
            legend: {
              labels: {
                font: {
                  weight: "500",
                },
                color: "#000000",
              },
            },
          },
        },
      };

      const initializeChart = (chartElement: HTMLCanvasElement, config: ChartConfigType) => new Chart(chartElement, config);

      initializeChart(canvas, config);

      return canvas;
    }

    function generateRandomColors(count: number): string[] {
      const randomColors: string[] = [];

      for (let i: number = 0; i < count; i++) {
        const color: string = "#" + Math.floor(Math.random() * 16777215).toString(16);
        randomColors.push(color);
      }

      return randomColors;
    }
  }
}