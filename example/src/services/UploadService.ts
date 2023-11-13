import { injectable } from "helocore"
import { TFile } from "../types"

@injectable()
export default class UploadService {
  constructor() { }

  async Save(file: Array<TFile>): Promise<string> {
    return 'url'
  }
}