# helocore

[![NPM
version](https://img.shields.io/npm/v/helocore.svg?style=flat)](https://www.npmjs.com/package/helocore)
[![NPM
downloads](https://img.shields.io/npm/dm/helocore.svg?style=flat)](https://www.npmjs.com/package/helocore)

A lightweight Node.js and TypeScript dependency injection framework powered [tsyringe](https://github.com/Microsoft/tsyringe). for building APIs and microservices. You can use only with [fastify](https://github.com/fastify/fastify).

### Table of Contents
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Decorators](#decorators)
  - [Controller()](#controller)
  - [Get(), Post(), Put(), Delete(), Head(), Patch(), Options()](#get-post-put-delete-head-patch-options)
  - [Request(), Body(), Params(), Query(), Headers(), Reply()](#request-body-params-query-headers-reply)
  - [Middleware() and defineMiddleware](#middleware-and-definemiddleware)
  - [Permissions()](#permissions)
  - [RateLimit()](#ratelimit)
  - [CustomParamDecorator](#customparamdecorator)
  - [Service](#service)
  - [Events](#events)
  - [EndpointOptions](#endpointoptions)

## Installation

```sh
npm install --save helocore
```

Modify your `tsconfig.json` to include the following settings

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## Quick Start

```typescript
// Redis.ts
import { singleton } from "helocore";

@singleton()
export default class Redis {
  // ...
}
```

```typescript
// ResponseModel.ts
export default class ResponseModel<T> {
  public data?: T
  public status_code: number = 200
  public trace_id: string = ""
}
```

```typescript
// application.ts
import { Modules, PermissionModule, HandleErrorResponse, DataSource, dataSourceList, EventsModules } from "helocore";
import TestController from './TestController'
import PermissionControl from './PermissionControl'
import Redis from './Redis'
import ResponseModel from './ResponseModel'
import EventsTest from './Events'

// Controller layer defining
Modules([
  TestController
])

// Event layer defining
EventsModules([
  EventsTest
])

// Permission Control Layer
PermissionModule(PermissionControl)

// --> Datasource layer. You can take connection container defined key.
// example
// dataSourceList.redis => giving containered Redis
DataSource({
  redis: Redis
})

// --> Controller Handle Error
// error => error
// traceId => generated request unique key
// step => <controller | service>
// lang => req.headers['accept-language']
HandleErrorResponse<ResponseModel<any>>(async (error: any, traceId: string, step: string, lang: string) => {
  const response = new ResponseModel()
  response.status_code = 400
  response.trace_id = traceId
  return response
})
```

```typescript
// index.ts
import "reflect-metadata";
import "./application";
import { fetchRoutes } from "helocore";

const fastify = Fastify()

fastify.register((app, _, done) => {
  fetchRoutes(app)
  done()
}, { prefix: '/api/v1' })

fastify.listen({ port: 3000 }, () => console.log('API is Running'))
```

## Decorators

### Controller()

This decorator is determine your prefix routes and at the same time your controller layer

#### Usage

```typescript
import { Controller, injectable } from "helocore";

@Controller('/prefix')
@injectable()
export default class TestController {
  // ...
}
```

### Get(), Post(), Put(), Delete(), Head(), Patch(), Options()

These decorators are determine your routes endpoints

#### Usage

```typescript
// TestService.ts
import { Service, injectable } from "helocore";

@Service // not must. only for logs now
@injectable()
export default class TestService {
  Get(lang) {
    return {
      name: 'helocore'
    }
  }
}
```

```typescript
import { Controller, Get, injectable } from "helocore";
import TestService from "./TestService";

@Controller('/prefix')
@injectable()
export default class TestController {
  
  constructor(
    private readonly testService: TestService
  ) { }

  @Get('/get') // endpoint => /api/v1/prefix/get -- Method => GET
  async Get() {
    const testData = await this.testService.Get()
    // ...
  }
}
```

### Request(), Body(), Params(), Query(), Headers(), Reply()

#### Usage
```typescript
import { Controller, Post, Body, injectable } from "helocore";

@Controller('/prefix')
@injectable()
export default class TestController {
  
  @Post('/save')
  Save(@Body() body: TBody) {
    // ...
  }
}
```

### Middleware() and defineMiddleware

This decorator is determine middleware layer on your routes. this layer run before run from controller layer. We have two selection middleware type

- [Prefix](#prefix)
- [Endpoint](#endpoint)

#### Usage

```typescript
// testvalidation.ts
import { defineMiddleware, Body, singleton } from "helocore";

@defineMiddleware
@singleton()
export default class TestValidation {
  
  Validation(@Body body: TBody) {
    // ...
  }
}
```

##### Prefix

```typescript
// testcontroller.ts
import { Controller, Body, injectable, Post } from "helocore";
import TestValidation from "./testvalidation";

@Controller('/prefix', [ // prefix middleware
  {
    funcs: ['Validation'],
    class: TestValidation
  }
])
@injectable()
export default class TestController {
  
  @Post('/save')
  Save(@Body body: TBody) {
    // ...
  }
}
```

##### Endpoint

```typescript
// testcontroller.ts
import { Controller, Body, Middleware, injectable, Post } from "helocore";
import TestValidation from "./testvalidation";

@Controller('/prefix')
@injectable()
export default class TestController {
  
  @Post('/save')
  @Middleware([
    {
      funcs: ['Validation'],
      class: TestValidation
    }
  ])
  Save(@Body body: TBody) {
    // ...
  }
}
```

### Permissions()

This decorator is determine permission middleware layer. 

#### Usage

```typescript
// PermissionControl.ts
import { singleton, definePermission, Request, Body, IDefinePermission } from "helocore";

@definePermission
@singleton()
export default class PermissionControl implements IDefinePermission {
  
  async CheckPermission(permissions: Array<string>, @Request req: FastifyRequest, @Body body: TBody): Promise<boolean> {
    // ...
    // permissions => ['test.create', 'test.list']
    return true
  }
}
```

```typescript
// testcontroller.ts
import { Controller, Body, Middleware, injectable, Post, Permissions } from "helocore";

@Controller('/prefix')
@injectable()
export default class TestController {
  
  @Post('/save')
  @Permissions('test.create', 'test.list')
  Save(@Body body: TBody) {
    // ...
  }
}
```

### RateLimit()

This decorator is determine request limit on your route. You can look here ratelimit [doc](https://github.com/fastify/fastify-rate-limit) 

#### Usage

```typescript
// index.ts
import "reflect-metadata";
import "./application";
import Fastify from 'fastify';
import RateLimit from '@fastify/rate-limit';
import { fetchRoutes } from "helocore";

const fastify = Fastify()

fastify.register(RateLimit, {
  errorResponseBuilder: function (request, context) {
    return {
      code: 429,
      error: 'Too Many Requests',
      message: `Rate limit exceeded, retry in ${context.after}. Try again soon.`,
      expiresIn: Math.ceil(context.ttl / 1000)// seconds
    }
  }
})

fastify.register((app, _, done) => {
  fetchRoutes(app)
  done()
}, { prefix: '/api/v1' })

fastify.listen({ port: 3000 }, () => console.log('API is Running'))
```

```typescript
// testcontroller.ts
import { Controller, Body, RateLimit, injectable, Post } from "helocore";

@Controller('/prefix')
@injectable()
export default class TestController {
  
  @Post('/save')
  @RateLimit({
    max: 3,
    timeWindow: 10000
  })
  Save(@Body body: TBody) {
    // ...
  }
}
```

### CustomParamDecorator

You can define custom param decorator

#### Usage

```typescript
// customdecorators.ts
import { FastifyRequest } from 'fastify';
import { createParamDecorator } from "helocore";

export const Lang = createParamDecorator((req: FastifyRequest) => {
  return req.headers['accept-language']
})
```

```typescript
// testcontroller.ts
import { Controller, injectable, Post } from "helocore";
import { Lang } from "./customdecorators";

@Controller('/prefix')
@injectable()
export default class TestController {
  
  @Post('/save')
  Save(@Lang lang: string ) {
    console.log(lang)
    // ...
  }
}
```

### Service

You can determine service for logs

#### Usage

```typescript
// TestService.ts
import { Service, injectable } from "helocore";

@Service // not must. only for logs now
@injectable()
export default class TestService {
  Save(lang) {
    console.log(lang)
    // ...
  }
}
```

```typescript
// testcontroller.ts
import { Controller, injectable, Post } from "helocore";
import TestService from "./TestService";

@Controller('/prefix')
@injectable()
export default class TestController {
  constructor(
    private readonly testService: TestService
  ) { }
  
  @Post('/save')
  Save() {
    this.testService.Save(lang)
    // ...
  }
}
```

### Events

You can determine events

#### Usage

```typescript
// events.ts
import { OnEvent, injectable } from 'helocore'

@injectable()
export default class EventTest {
  @OnEvent('test')
  create(data: object) {
    console.log(data)
  }
}
```

```typescript
// application.ts
import { EventsModule } from 'helocore'
import EventTest from "./EventTest"

// ..
EventsModule([
  EventTest
])
// ..
```

```typescript
// eventcontroller.ts
import { Controller, Events, Get, injectable } from 'helocore'

@Controller('/event')
@injectable()
export default class EventController {
  constructor(
    private readonly events: Events
  ) { }

  @Get('/')
  async EventTest() {
    this.events.emit('test', { message: 'test_message' })
    // ...
  }
}
```

### EndpointOptions

it can use fastify route options

#### Usage

```typescript
// controller.ts
import { Controller, EndpointOptions, Post, injectable } from 'helocore'

@Controller('/')
@injectable()
export default class TestController {
  @Post('/')
  @EndpointOptions({ // fastify route options
    bodyLimit: 10485760 // json body 11MB
  })
  async Test() {
    // ...
  }
}
```


## Contributing

This project welcomes contributions and suggestions. If you see missing or want to improve on this project, you can create issue and open pull request.