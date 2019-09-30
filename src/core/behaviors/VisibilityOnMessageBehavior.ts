import { Message } from "../message/message";
import { IBehavior } from "./IBehavior";
import { IBehaviorBuilder } from "./IBehaviorBuilder";
import { IMessageHandler } from "../message/IMessageHandler";
import { BaseBehavior } from "./BaseBehavior";
import { IBehaviorData } from "./IBehaviorData";

export class VisibilityOnMessageBehaviorData implements IBehaviorData {
  public name: string | undefined;
  public messageCode: string | undefined;
  public visible: boolean | undefined;

  public setFromJson(json: any): void {
    if (json.messageCode === undefined) {
      throw new Error("VisibilityOnMessageBehaviorData requires 'messageCode' to be defined.");
    } else {
      this.messageCode = String(json.messageCode);
    }

    if (json.visible === undefined) {
      throw new Error("VisibilityOnMessageBehaviorData requires 'visible' to be defined.");
    } else {
      this.visible = Boolean(json.visible);
    }
  }
}

export class VisibilityOnMessageBehaviorBuilder implements IBehaviorBuilder {

  public get type(): string {
    return "visibilityOnMessage";
  }

  public buildFromJson(json: any): IBehavior {
    let data = new VisibilityOnMessageBehaviorData();
    data.setFromJson(json);
    return new VisibilityOnMessageBehavior(data);
  }
}

export class VisibilityOnMessageBehavior extends BaseBehavior implements IMessageHandler {

  private _messageCode: string;
  private _visible: boolean;

  public constructor(data: VisibilityOnMessageBehaviorData) {
    super(data);

    if (data.messageCode === undefined) {
      throw new Error("VisibilityOnMessageBehavior requires 'messageCode' to be defined.");
    }

    if (data.visible === undefined) {
      throw new Error("VisibilityOnMessageBehavior requires 'visible' to be defined.");
    }

    this._messageCode = data.messageCode;
    this._visible = data.visible;

    Message.subscribe(this._messageCode, this);
  }

  public onMessage(message: Message): void {
    if (this._owner === undefined) {
      throw new Error("owner is undefined.");
    }
    if (message.code === this._messageCode) {
      this._owner.isVisible = this._visible;
    }
  }
}
