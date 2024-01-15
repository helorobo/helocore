import { HandleErrorResponse, Modules, EventsModule } from "helocore"

import UploadController from "./src/controllers/UploadController"
import EventController from "./src/controllers/EventController"
import ServiceResponse from "./src/models/ServiceResponse"
import { handleError } from "./src/modules/HandleError"
import EventTest from "./src/events/Events"

Modules([
  UploadController,
  EventController
])

EventsModule([
  EventTest
])

HandleErrorResponse<ServiceResponse<any>>((error: any, traceId: string, step: string, lang: string) => handleError(error, traceId, step, lang))