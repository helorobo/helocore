export let handleErrorFunction: Function = null

/**
 * 
 * Only work for Rest API
 */
export function HandleErrorResponse<T>(func: (error: any, traceId: string, step: string, lang: string) => Promise<T>) {
  handleErrorFunction = func
}