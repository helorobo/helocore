import { Modules, coreSettings } from "helocore"

import TestController from "./src/controller"

coreSettings.logger = true

Modules([
  TestController
])