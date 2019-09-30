import { SpriteComponentData } from "./SpriteComponent";
import { IComponentData } from "./IComponentData";
import { IComponentBuilder } from "./IComponentBuilder";
import { IComponent } from "./IComponent";
import { BaseComponent } from "./baseComponent";
import { AnimatedSprite, AnimatedSpriteInfo } from "../graghics/AnimatedSprite";
import { Shader } from "../gl/shaders/shader";

export class AnimatedSpriteComponentData extends SpriteComponentData implements IComponentData {
  public frameWidth: number | undefined;
  public frameHeight: number | undefined;
  public frameCount: number | undefined;
  public autoPlay = true;
  public frameSequence: number[] = [];
  public frameTime = 33;

  public setFromJson(json: any): void {
    super.setFromJson(json);

    if (json.autoPlay !== undefined) {
      this.autoPlay = Boolean(json.autoPlay);
    }

    if (json.frameWidth === undefined) {
      throw new Error('AnimatedSpriteComponentData requires "frameWidth".');
    } else {
      this.frameWidth = Number(json.frameWidth);
    }

    if (json.frameHeight === undefined) {
      throw new Error('AnimatedSpriteComponentData requires "frameHeight".');
    } else {
      this.frameHeight = Number(json.frameHeight);
    }

    if (json.frameCount === undefined) {
      throw new Error('AnimatedSpriteComponentData requires "frameCount".');
    } else {
      this.frameCount = Number(json.frameCount);
    }

    if (json.frameSequence === undefined) {
      throw new Error('AnimatedSpriteComponentData requires "frameSequence".');
    } else {
      this.frameSequence = json.frameSequence;
    }
  }
}

export class AnimatedSpriteComponentBuilder implements IComponentBuilder {
  public get type(): string {
    return 'animatedSprite';
  }

  public buildFromJson(gl: WebGLRenderingContext, json: any): IComponent {
    const data = new AnimatedSpriteComponentData();
    data.setFromJson(json);
    return new AnimatedSpriteComponent(gl, data);
  }
}

export class AnimatedSpriteComponent extends BaseComponent {
  private _autoPlay = true;
  private _sprite: AnimatedSprite;

  public constructor(gl: WebGLRenderingContext, data: AnimatedSpriteComponentData) {
    super(data);

    if (this.name === undefined || data.materialName === undefined) {
      throw new Error('create AnimatedSpriteComponent error, name or materialName undefined.');
    }

    if (data.autoPlay !== undefined) {
      this._autoPlay = Boolean(data.autoPlay);
    }

    const spriteInfo = new AnimatedSpriteInfo();
    spriteInfo.name = name;
    spriteInfo.materialName = data.materialName;
    data.frameWidth !== undefined && (spriteInfo.frameWidth = data.frameWidth);
    data.frameHeight !== undefined && (spriteInfo.frameHeight = data.frameHeight);
    data.frameWidth !== undefined && (spriteInfo.width = data.frameWidth);
    data.frameHeight !== undefined && (spriteInfo.height = data.frameHeight);
    data.frameCount !== undefined && (spriteInfo.frameCount = data.frameCount);
    spriteInfo.frameSequence = data.frameSequence;
    spriteInfo.frameTime = data.frameTime;

    this._sprite = new AnimatedSprite(gl, spriteInfo);
  }

  public get isPlaying(): boolean {
    return this._sprite.isPlaying;
  }

  public load() {
    this._sprite.load();
  }

  public updateReady(): void {
    if (!this._autoPlay) {
      this._sprite.stop();
    }
  }

  public update(time: number) {
    this._sprite.update(time);

    super.update(time);
  }

  public render(shader: Shader) {
    if (this.owner === undefined) {
      throw new Error('owner is undefined.');
    }
    this._sprite.draw(shader, this.owner.worldMatrix);

    super.render(shader);
  }

  public play() {
    this._sprite.play();
  }

  public stop() {
    this._sprite.stop();
  }

  public setFrame(frameNumber: number) {
    this._sprite.setFrame(frameNumber);
  }
}
