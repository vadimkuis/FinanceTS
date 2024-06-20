import { CustomHttp } from "./custom-http";
import config from "../../config/config";
import dayjs from "dayjs";
import {OperationType} from "../types/operation.type";

export class GetOperation {
  public static async getOperationsByPeriod(period: string, from?: string, to?: string): Promise<OperationType[]> {
    let url: string = config.host + '/operations?' + 'period=' + period;

    if (from && to) {
      let dateFrom: string = dayjs(from, "DD.MM.YYYY").format("YYYY-MM-DD");
      let dateTo: string = dayjs(to, "DD.MM.YYYY").format("YYYY-MM-DD");
      url += '&dateFrom=' + dateFrom + '&dateTo=' + dateTo;
    }

    return await CustomHttp.request(url);
  }
}
