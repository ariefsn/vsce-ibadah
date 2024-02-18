import { AxiosInstance } from "axios";
import { IHttpResponse, IPrayer, IPrayerByCalendarCityDto } from "../entities";

export default class Prayer {
  _http: AxiosInstance

  constructor(http: AxiosInstance) {
    this._http = http
  }

  getPrayerByCalendarCity = async (payload: IPrayerByCalendarCityDto): Promise<IHttpResponse<IPrayer[]>> => {
    const { data } = await this._http.get<IHttpResponse<IPrayer[]>>(`/calendarByCity/${payload.year}/${payload.month}`, {
      params: {
        city: payload.city,
        country: payload.country,
        method: payload.method
      }
    })
    return data
  }

  getPrayerByAddress = async (payload: IPrayerByCalendarCityDto): Promise<IHttpResponse<IPrayer[]>> => {
    const address = [payload.postalCode, payload.city, payload.country]
    if (payload.address) {
      address.unshift(payload.address)
    }
    const { data } = await this._http.get<IHttpResponse<IPrayer[]>>(`/calendarByAddress/${payload.year}/${payload.month}`, {
      params: {
        address: address.join(','),
        method: payload.method
      }
    })
    return data
  }
}