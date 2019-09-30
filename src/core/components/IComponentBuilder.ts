import { IComponent } from "./IComponent";

export interface IComponentBuilder {
  readonly type: string;

  buildFromJson(gl: WebGLRenderingContext, json: any): IComponent;
}
