import { HandleErrorResponse, Modules, coreSettings } from "helocore"

import TestController from "./src/controller"

coreSettings.logger = true

Modules([
  TestController
])

// HandleErrorResponse<ServiceResponse<any>>((error: any, traceId: string, step: string, lang: string) => handleError(error, traceId, step, lang))