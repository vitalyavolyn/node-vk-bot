export type VKResponse = any

export interface VKError {
  method?: string
  error_code: number,
  error_msg: string,
  request_params?: {
    [prop: number]: { key: string, value: string }
  }
}

export interface VKExecuteResponse {
  response?: VKResponse,
  execute_errors?: VKError[],
  error?: VKError
}
