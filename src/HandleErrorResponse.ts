export let handleErrorFunction: Function = null

export function HandleErrorResponse<T>(func: (error: any, traceId: string, step: string, lang: string) => Promise<T>) {
  handleErrorFunction = func
}