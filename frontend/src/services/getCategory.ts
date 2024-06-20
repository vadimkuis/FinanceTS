import {CustomHttp} from "./custom-http";
import config from "../../config/config";
import {CategoriesResponseType} from "../types/categoty-response.type";

export class GetCategory {
  // запрос на сервер для получения списка категорий с указание типа
  public static async categories(typeCategory: string): Promise<CategoriesResponseType[]> {
    return await CustomHttp.request(config.host + '/categories/' + typeCategory);
  }
}