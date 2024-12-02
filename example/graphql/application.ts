import { HandleErrorResponse, Modules, coreSettings } from "helocore"

import UploadController from "./src/controller"

coreSettings.logger = true

Modules([
  UploadController,
])

// HandleErrorResponse<ServiceResponse<any>>((error: any, traceId: string, step: string, lang: string) => handleError(error, traceId, step, lang))