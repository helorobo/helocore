import { Body, Controller, EndpointOptions, File, Middleware, Post, RateLimit, injectable } from 'helocore'
import ServiceResponse from '../models/ServiceResponse'
import { TFile } from '../types'
import Validation from '../middleware/Validation'
import { CustomTest } from '../modules/CustomDecorator'
import UploadService from '../services/UploadService'

@Controller('/upload')
@injectable()
export default class UploadController {
  constructor(
    private readonly uploadService: UploadService
  ) { }

  @Post('/')
  @Middleware([{ funcs: ['FilterMimeType'], class: Validation }])
  @RateLimit({
    max: 3,
    timeWindow: 10000
  })
  async FileUpload(@File('file') file: Array<TFile>, @CustomTest data: string): Promise<ServiceResponse<any>> {
    const url = await this.uploadService.Save(file)
    // ...services layer process

    const serviceResponse = new ServiceResponse<any>()
    serviceResponse.data = {
      url: 'url'
    }
    return serviceResponse
  }

  @Post('/json-body')
  @EndpointOptions({
    bodyLimit: 10485760 // json body 11MB
  })
  async JsonBody(@Body body: any): Promise<ServiceResponse<any>> {
    const serviceResponse = new ServiceResponse<any>()
    return serviceResponse
  }

}