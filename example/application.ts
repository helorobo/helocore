import { HandleErrorResponse, Modules } from "helocore"

import UploadController from "./src/controllers/UploadController"
import ServiceResponse from "./src/models/ServiceResponse"
import { handleError } from "./src/modules/HandleError"

Modules([
  UploadController
])

HandleErrorResponse<ServiceResponse<any>>((error: any, traceId: string, step: string, lang: string) => handleError(error, traceId, step, lang))