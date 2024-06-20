import { GetOperation } from "./getOperation";
import { OperationType } from "../types/operation.type";

export class Filters {
  readonly period: string;
  readonly from?: string;
  readonly to?: string;

  constructor(period: string, from?: string, to?: string) {
    this.period = period;
    this.from = from;
    this.to = to;
  }

  async getData(): Promise<[string[], number[], string[], number[]]> {
    const [incomesCategories, incomesData, expenseCategories, expensesData]:[string[], number[], string[], number[]] = await this.fetchData();
    return [incomesCategories, incomesData, expenseCategories, expensesData];
  }

  private async fetchData(): Promise<[string[], number[], string[], number[]]> {
    const operations: OperationType[] = await GetOperation.getOperationsByPeriod(
      this.period,
      this.from,
      this.to
    );

    // разделяются операции на доходы и расходы, получаем уникальные категории
    const [incomesOperations, expenseOperations]: [OperationType[], OperationType[]] = this.getOperationsByCategory(operations);
    const incomesCategories: string[] = this.getUniqueCategories(incomesOperations);
    const expenseCategories: string[] = this.getUniqueCategories(expenseOperations);

    // вычисляется сумма для каждой категории доходов и расходов
    const incomesData: number[] = this.calculateTotalAmountsByCategory(incomesOperations, incomesCategories);
    const expensesData: number[] = this.calculateTotalAmountsByCategory(expenseOperations, expenseCategories);

    return [incomesCategories, incomesData, expenseCategories, expensesData];
  }

  private getOperationsByCategory(operations: OperationType[]): [OperationType[], OperationType[]] {
    // принимается массив операций и разделяет его на доходы и расходы
    const incomesOperations: OperationType[] = operations.filter((operation: OperationType) => operation.type === "income");
    const expenseOperations: OperationType[] = operations.filter((operation: OperationType) => operation.type === "expense");
    return [incomesOperations, expenseOperations];
  }

  private getUniqueValues(arr: string[]): string[] {
    // принимается массив и возвращает массив уникальных значений
    let result: string[] = [];
    for (let str of arr) {
      if (!result.includes(str)) {
        result.push(str);
      }
    }
    return result;
  }

  private getUniqueCategories(operations: OperationType[]): string[] {
    // принимается массив операций и возвращает массив уникальных категорий
    return this.getUniqueValues(operations.map(({ category }) => category));
  }

  private calculateTotalAmountsByCategory(operationsArray: OperationType[], categories: string[]): number[] {
    return categories.map((category: string) =>
      operationsArray
        .filter((operation: OperationType) => operation.category === category)
        .reduce((acc: number, operation: OperationType) => acc + operation.amount, 0)
    );
  }
}