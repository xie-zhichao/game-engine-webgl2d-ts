import { IBehaviorData } from "./IBehaviorData";
import { IBehaviorBuilder } from "./IBehaviorBuilder";
import { IBehavior } from "./IBehavior";
import { BaseBehavior } from "./BaseBehavior";
import { IMessageHandler } from "../message/IMessageHandler";
import { Message } from "../message/message";
import { MouseContext } from "../input/InputManager";

export class MouseClickBehaviorData implements IBehaviorData {
  public name: string | undefined;
  public width = 0;
  public height = 0;
  public messageCode: string | undefined;

  public setFromJson(json: any) {
    if (json.name === undefined) {
      throw new Error('name must be defined in behavior data.');
    } else {
      this.name = String(json.name);
    }

    if (json.width === undefined) {
      throw new Error('width must be defined in behavior data.');
    } else {
      this.width = Number(json.width);
    }

    if (json.height === undefined) {
      throw new Error('height must be defined in behavior data.');
    } else {
      this.height = Number(json.height);
    }

    if (json.messageCode === undefined) {
      throw new Error('messageCode must be defined in behavior data.');
    } else {
      this.messageCode = String(json.messageCode);
    }
  }
}

export class MouseClickBehaviorBuilder implements IBehaviorBuilder {
  public get type(): string {
    return 'mouseClick';
  }

  public buildFromJson(json: any): IBehavior {
    const data = new MouseClickBehaviorData();
    data.setFromJson(json);

    return new MouseClickBehavior(data);
  }
}

export class MouseClickBehavior extends BaseBehavior implements IMessageHandler {
  private _width: number;
  private _height: number;
  private _messageCode: string;

  public constructor(data: MouseClickBehaviorData) {
    super(data);

    this._width = data.width;
    this._height = data.height;
    if (data.messageCode === undefined) {
      throw new Error('messageCode is undefined.');
    }
    this._messageCode = data.messageCode;
    Message.subscribe('MOUSE_UP', this);
  }

  public onMessage(message: Message) {
    if (message.code === 'MOUSE_UP' && !this._owner!.isVisible) {
      return;
    }
    const context = message.context as MouseContext;
    const worldPos = this._owner!.getWorldPosition();
    const eventsX = worldPos.x + this._width;
    const eventsY = worldPos.y + this._height;
    if (context.position.x >= worldPos.x && context.position.x < eventsX &&
      context.position.y >= worldPos.y && context.position.y < eventsY) {
        Message.send(this._messageCode, this);
      }
  }
}
