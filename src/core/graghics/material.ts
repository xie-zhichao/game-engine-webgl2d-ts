import { Texture } from "./texture";
import { TextureManager } from "./textureManager";
import { Color } from "./color";

export class Material {
  private gl: WebGLRenderingContext;
  private _name: string;
  private _diffuseTextureName: string;
  private _diffuseTexture: Texture | undefined;
  private _tint: Color;

  public constructor(gl: WebGLRenderingContext, name: string, diffuseTextureName: string, tint: Color) {
    this.gl = gl;
    this._name = name;
    this._diffuseTextureName = diffuseTextureName;
    this._tint = tint;

    this._diffuseTexture = TextureManager.getTexture(gl, this._diffuseTextureName);
  }

  public get name(): string {
    return this._name;
  }

  public get diffuseTextureName(): string {
    return this._diffuseTextureName;
  }

  public get diffuseTexture(): Texture | undefined {
    return this._diffuseTexture;
  }

  public get tint(): Color {
    return this._tint;
  }

  public set diffuseTextureName(value: string) {
    TextureManager.releaseTexture(this._diffuseTextureName);
    this._diffuseTextureName = value;
    this._diffuseTexture = TextureManager.getTexture(this.gl, this._diffuseTextureName);
  }

  public destroy(): void {
    TextureManager.releaseTexture(this._diffuseTextureName);
    this._diffuseTexture = undefined;
  }
}