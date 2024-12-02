import { injectable } from 'helocore'
import { Variables, Mutation, QraphqlResolver } from 'helocore/src/qraphql'
import { CreateUser } from './schema';

@QraphqlResolver()
@injectable()
export default class TestController {
  constructor(
  ) { }

  @Mutation(CreateUser)
  // @Middleware([{ funcs: ['FilterMimeType'], class: Validation }])
  async Test(@Variables data: any) {
    console.log(data)

  }

}