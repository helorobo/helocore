import { ZodError } from 'zod'
import ServiceResponse from "../models/ServiceResponse"

export async function handleError(error: any, traceId: string, step: string, lang: string) {
  console.log(error)
  const serviceResponse = new ServiceResponse()
  serviceResponse.status_code = 400
  serviceResponse.success = false
  serviceResponse.trace_id = traceId

  if (error.code === 'FST_REQ_FILE_TOO_LARGE') {
    error = {
      message: error.code
    }
    serviceResponse.message = error.message
  } else if (error instanceof TypeError) {
    serviceResponse.message = 'global.type_error'
  } else if (error instanceof ZodError) {
    serviceResponse.status_code = 422
    serviceResponse.message = 'global.validation_zod_error'
    serviceResponse.errors = error.issues.map(a => {
      return {
        message: a.message,
        fields: a.path
      }
    })
  } else if (error instanceof ServiceResponse) {
    serviceResponse.message = error.message
  } else if (typeof error === 'string') {
    serviceResponse.message = error
  } if (error instanceof Error) {
    serviceResponse.message = error.message
  } else {
    serviceResponse.message = 'global.bad_request'
  }

  return serviceResponse
}