import axios, { type AxiosInstance } from "axios";

let _http: AxiosInstance | undefined;

const http = (): AxiosInstance => {
  if (_http) {
    return _http
  }

  // https://api.aladhan.com/v1/calendarByCity/2024/2?city=Ngawi&country=Indonesia&method=2
  _http = axios.create({
    baseURL: "https://api.aladhan.com/v1"
  });

  return _http
}

export {
  http
};
