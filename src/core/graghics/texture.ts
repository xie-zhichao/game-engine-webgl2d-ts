import { IMessageHandler } from "../message/IMessageHandler";
import { AssetManager, MESSAGE_ASSET_LOADER_ASSET_LOADED } from "../assets/assetManager";
import { ImageAsset } from "../assets/imageAssetLoader";
import { Message } from "../message/message";

const LEVEL: number = 0;
const BODDER: number = 0;
const TEMP_IMAGE_DATA: Uint8Array = new Uint8Array([255, 255, 255, 255]);

export class Texture implements IMessageHandler {
  private _gl: WebGLRenderingContext;
  private _name: string;
  private _handle: WebGLTexture;
  private _isLoaded: boolean = false;
  private _width: number;
  private _height: number;

  public constructor(gl: WebGLRenderingContext, name: string, widht: number = 1, height: number = 1) {
    this._gl = gl;
    this._name = name;
    this._width = widht;
    this._height = height;

    const handle = gl.createTexture();
    if (handle === null) {
      throw new Error('create texture error.')
    }
    this._handle = handle;

    this.bind();

    gl.texImage2D(gl.TEXTURE_2D, LEVEL, gl.RGBA, 1, 1, BODDER,
      gl.RGBA, gl.UNSIGNED_BYTE, TEMP_IMAGE_DATA);

    const asset = AssetManager.getAsset(this._name) as ImageAsset;
    if (asset !== undefined) {
      this.loadTextureFromAsset(asset);
    } else {
      Message.subscribe(MESSAGE_ASSET_LOADER_ASSET_LOADED + this._name, this);
    }
  }

  public get name(): string {
    return this._name;
  }

  public get isLoaded(): boolean {
    return this._isLoaded;
  }

  public get width(): number {
    return this._width;
  }

  public get height(): number {
    return this._height;
  }

  public destroy(): void {
    this._gl.deleteTexture(this._handle);
  }

  public activateAndBind(textureUnit: number = 0): void {
    this._gl.activeTexture(this._gl.TEXTURE0 + textureUnit);

    this.bind();
  }

  public bind(): void {
    this._gl.bindTexture(this._gl.TEXTURE_2D, this._handle);
  }

  public unbind(): void {
    this._gl.bindTexture(this._gl.TEXTURE_2D, null);
  }

  public onMessage(message: Message): void {
    if (message.code === MESSAGE_ASSET_LOADER_ASSET_LOADED + this._name) {
      this.loadTextureFromAsset(message.context as ImageAsset);
    }
  }

  private loadTextureFromAsset(asset: ImageAsset) {
    this._width = asset.width;
    this._height = asset.height;

    this.bind();

    const { _gl } = this;
    _gl.texImage2D(_gl.TEXTURE_2D, LEVEL, _gl.RGBA, _gl.RGBA,
      _gl.UNSIGNED_BYTE, asset.data);

    if (this.isPowerOf2()) {
      _gl.generateMipmap(_gl.TEXTURE_2D);
    } else {
      _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_WRAP_S, _gl.CLAMP_TO_EDGE);
      _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_WRAP_T, _gl.CLAMP_TO_EDGE);
      _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.LINEAR);
    }
  }

  private isPowerOf2(): boolean {
    return this.isValuePowerOf2(this._width) && this.isValuePowerOf2(this._height);
  }

  private isValuePowerOf2(value: number): boolean {
    return (value & (value - 1)) === 0;
  }
}
