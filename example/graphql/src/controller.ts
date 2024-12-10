import { injectable, BodyVariables, Mutation, QraphqlResolver, GQuery, Middleware } from 'helocore'
import Validation from './Validation'

@QraphqlResolver()
@injectable()
export default class TestController {
  constructor(
  ) { }

  @Mutation('createUser', 'createUser(name: String!): User')
  @Middleware([{ funcs: ['Test'], class: Validation }])
  async Test(@BodyVariables variables: any) {
    console.log(variables)
    return variables
  }

  @GQuery('hello', 'hello: String')
  @Middleware([{ funcs: ['Test'], class: Validation }])
  async Test1() {
    return 'hello world'
  }

}