import { Shader } from "./shader";
import { HttpClient } from "../../../common/http/httpclient";

export class AsyncShaderLoader extends Shader {

  public static async load(name:string, gl: WebGLRenderingContext, vertexSourceUrl: string, fragmentSourceUrl: string): Promise<AsyncShaderLoader> {
    const { response: vertexSource } = await HttpClient.get(vertexSourceUrl);
    const { response: fragmentSource } = await HttpClient.get(fragmentSourceUrl);

    const shader = new Shader(name, gl);
    shader.load(vertexSource, fragmentSource);

    return shader;
  }
}
