export type VKResponse = any

export interface VKError {
  name: string,
  code: number,
  description: string
}

export interface VKExecuteResponse {
  response?: VKResponse,
  execute_errors?: VKError[]
}
