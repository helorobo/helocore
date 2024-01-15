import { Controller, Events, Get, injectable } from 'helocore'
import ServiceResponse from '../models/ServiceResponse'

@Controller('/event')
@injectable()
export default class UploadController {
  constructor(
    private readonly events: Events
  ) { }

  @Get('/')
  async EventTest() {
    this.events.emit('test', { message: 'test_message' })

    const serviceResponse = new ServiceResponse<any>()
    return serviceResponse
  }

}