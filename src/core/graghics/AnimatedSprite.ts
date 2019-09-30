import { Vector2 } from "../math/vector2";
import { IMessageHandler } from "../message/IMessageHandler";
import { Sprite } from "./sprite";
import { Message } from "../message/message";
import { MESSAGE_ASSET_LOADER_ASSET_LOADED, AssetManager } from "../assets/assetManager";
import { ImageAsset } from "../assets/imageAssetLoader";
import { MaterialManager } from "./materialManager";

class UVInfo {
  public min: Vector2;
  public max: Vector2;

  public constructor(min: Vector2, max: Vector2) {
    this.min = min;
    this.max = max;
  }
}

export class AnimatedSpriteInfo {
  public name: string | undefined;
  public materialName: string | undefined;
  public width: number = 100;
  public height: number = 100;
  public frameWidth: number = 10;
  public frameHeight: number = 10;
  public frameCount: number = 1;
  public frameSequence: number[] = [];
  public frameTime: number = 60;
}

export class AnimatedSprite extends Sprite implements IMessageHandler {
  private _frameWidth: number;
  private _frameHeight: number;
  private _frameCount: number;
  private _frameSequence: number[];

  private _frameTime = 333;
  private _frameUVs: UVInfo[] = [];

  private _currentFrame = 0;
  private _currentTime = 0;
  private _assetLoaded = false;
  private _assetWidth = 2;
  private _assetHeight = 2;
  private _isPlaying = true;

  public constructor(gl: WebGLRenderingContext, info: AnimatedSpriteInfo) {
    super(gl, info.name!, info.materialName!, info.width, info.height);

    this._frameWidth = info.frameWidth;
    this._frameHeight = info.frameHeight;
    this._frameCount = info.frameCount;
    this._frameSequence = info.frameSequence;
    this._frameTime = info.frameTime;

    Message.subscribe(MESSAGE_ASSET_LOADER_ASSET_LOADED + this.material!.diffuseTextureName, this);
  }

  public get isPlaying(): boolean {
    return this._isPlaying;
  }

  public play() {
    this._isPlaying = true;
  }

  public stop() {
    this._isPlaying = false;
  }

  public destroy() {
    super.destroy();
  }

  public setFrame(frameNumber: number) {
    if (frameNumber >= this._frameCount) {
      throw new Error(`Frame is out of range: ${frameNumber}, frame count: ${this._frameCount}`);
    }

    this._currentFrame = frameNumber;
  }

  public onMessage(message: Message) {
    if (message.code === MESSAGE_ASSET_LOADER_ASSET_LOADED + this.material!.diffuseTextureName) {
      this._assetLoaded = true;
      const asset = message.context as ImageAsset;
      this._assetWidth = asset.width;
      this._assetHeight = asset.height;

      this.caculateUVs();
    }
  }

  public load() {
    super.load();

    if (!this._assetLoaded) {
      this.setupFromMaterial();
    }
  }

  public update(time: number) {
    if (!this._assetLoaded) {
      this.setupFromMaterial();
      return;
    }

    if (!this._isPlaying) {
      return;
    }

    this._currentTime += time;
    if (this._currentTime > this._frameTime) {
      if (this.buffer === undefined) {
        throw new Error('buffer is not initialized!');
      }

      this._currentFrame++;
      this._currentTime = 0;

      if (this._currentFrame >= this._frameSequence.length) {
        this._currentFrame = 0;
      }

      const frameUVs = this._frameSequence[this._currentFrame];
      this.vertices[0].texCoords.copyFrom(this._frameUVs[frameUVs].min);
      this.vertices[1].texCoords.copyFrom(new Vector2(this._frameUVs[frameUVs].min.x, this._frameUVs[frameUVs].max.y));
      this.vertices[2].texCoords.copyFrom(this._frameUVs[frameUVs].max);
      this.vertices[3].texCoords.copyFrom(this._frameUVs[frameUVs].max);
      this.vertices[4].texCoords.copyFrom(new Vector2(this._frameUVs[frameUVs].max.x, this._frameUVs[frameUVs].min.y));
      this.vertices[5].texCoords.copyFrom(this._frameUVs[frameUVs].min);

      for (const v of this.vertices) {
        this.buffer.pushBackData(v.toArray());
      }

      this.buffer.upload();
      this.buffer.unbind();
    }

    super.update(time);
  }

  private caculateUVs() {
    let totalWidth = 0;
    let yValue = 0;

    for (let i = 0; i < this._frameCount; i++) {
      totalWidth += i * this._frameWidth;
      if (totalWidth > this._assetWidth) {
        yValue++;
        totalWidth = 0;
      }

      const u = (i * this._frameWidth) / this._assetWidth;
      const v = (yValue * this._frameHeight) / this._assetHeight;
      const min = new Vector2(u, v);

      const uMax = ((i * this._frameWidth) + this._frameWidth) / this._assetWidth;
      const vMax = ((yValue * this._frameHeight) + this._frameHeight) / this._assetHeight;
      const max = new Vector2(uMax, vMax);

      this._frameUVs.push(new UVInfo(min, max));
    }
  }

  private setupFromMaterial() {
    if (!this._assetLoaded) {
      const material = MaterialManager.getMaterial(this.materialName);
      if (material && material.diffuseTexture && material.diffuseTexture.isLoaded) {
        if (AssetManager.isAssetLoaded(material.diffuseTextureName)) {
          this._assetWidth = material.diffuseTexture.width;
          this._assetHeight = material.diffuseTexture.height;
          this._assetLoaded = true;
          this.caculateUVs();
        }
      }
    }
  }
}
