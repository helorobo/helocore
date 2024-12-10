import { OnEvent, injectable } from 'helocore'

@injectable()
export default class EventTest {
  @OnEvent('test')
  create(data: object) {
    console.log(data)
  }
}