import { Vector3 } from "../math/vector3";
import { IComponentData } from "./IComponentData";
import { IComponentBuilder } from "./IComponentBuilder";
import { IComponent } from "./IComponent";
import { BaseComponent } from "./baseComponent";
import { IMessageHandler } from "../message/IMessageHandler";
import { Message } from "../message/message";
import { Shader } from "../gl/shaders/shader";
import { BitmapText } from "../graghics/BitmapText";

export class BitmapTextComponentData implements IComponentData {
  public name: string | undefined;
  public fontName: string | undefined;
  public origin = Vector3.zero;
  public text: string | undefined;

  public setFromJson(json: any): void {
    if (json.name !== undefined) {
      this.name = String(json.name);
    }

    if (json.fontName !== undefined) {
      this.fontName = String(json.fontName);
    }

    if (json.text !== undefined) {
      this.text = String(json.text);
    }

    if (json.origin !== undefined) {
      this.origin.setFromJson(json.origin);
    }
  }
}

export class BitmapTextComponentBuilder implements IComponentBuilder {
  public get type(): string {
    return "bitmapText";
  }

  public buildFromJson(gl: WebGLRenderingContext, json: any): IComponent {
    let data = new BitmapTextComponentData();
    data.setFromJson(json);
    return new BitmapTextComponent(gl, data);
  }
}

export class BitmapTextComponent extends BaseComponent implements IMessageHandler {
  private _bitmapText: BitmapText;
  private _fontName: string;

  public constructor( gl: WebGLRenderingContext, data: BitmapTextComponentData) {
    super(data);

    if (data.fontName === undefined) {
      throw new Error('BitmapTextComponent requires "fontName".')
    }

    this._fontName = data.fontName;
    this._bitmapText = new BitmapText(this.name!, this._fontName, gl);
    if (!data.origin.equals(Vector3.zero)) {
      this._bitmapText.origin.copyFrom(data.origin);
    }

    this._bitmapText.text = data.text!;

    // Listen for text updates.
    Message.subscribe(this.name + ":SetText", this);
  }

  public load(): void {
    this._bitmapText.load();
  }

  public update(time: number): void {
    this._bitmapText.update(time);
  }

  public render(shader: Shader): void {
    if (this.owner === undefined) {
      throw new Error("owner is undefined.");
    }
    this._bitmapText.draw(shader, this.owner.worldMatrix);
    super.render(shader);
  }

  public onMessage(message: Message): void {
    if (message.code === this.name + ":SetText") {
      this._bitmapText.text = String(message.context);
    }
  }
}
