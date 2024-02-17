export interface IHttpResponse<T> {
  code: number
  status: string
  data: T
}
