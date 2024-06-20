export type DefaultResponseType = {
  error: true,
  message: string,
  validation?: Array<{ key: string; message: string }>
}