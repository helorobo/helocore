export default class ServiceResponse<T> {
  public items?: T
  public data?: T
  public success: boolean = true
  public message: string = ""
  public status_code: number = 200
  public trace_id: string = ""
  public errors: Array<{ message: string }> = []
}