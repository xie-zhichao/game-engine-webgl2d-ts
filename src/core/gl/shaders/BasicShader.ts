import { Shader } from "./shader";
import { HttpClient } from "../../../common/http/httpclient";

export class BasicShader extends Shader {
  private _isLoaded = false;

  get isLoaded(): boolean {
    return this._isLoaded;
  }

  public constructor(name: string) {
    super(name);
  }

  public async loadAsync(vertexSourceUrl: string, fragmentSourceUrl: string) {
    const { response: vertexSource } = await HttpClient.get(vertexSourceUrl);
    const { response: fragmentSource } = await HttpClient.get(fragmentSourceUrl);

    this.load(vertexSource, fragmentSource);
    this._isLoaded = true;
  }
}
