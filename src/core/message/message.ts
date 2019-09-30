import { MessageBus } from "./messageBus";
import { IMessageHandler } from "./IMessageHandler";

export enum MessagePriority {
  NORMAL,
  HIGH
}

export class Message {
  public code: string;
  public context: any;
  public sender: any;
  public priority: MessagePriority;

  public constructor(code: string, sender: any, context?: any, priority: MessagePriority = MessagePriority.NORMAL) {
    this.code = code;
    this.sender = sender;
    this.context = context;
    this.priority = priority;
  }

  public static send(code: string, sender: any, context?: any): void {
    MessageBus.post(new Message(code, sender, context));
  }

  sendPriority(code: string, sender: any, context?: any): void {
    MessageBus.post(new Message(code, sender, context, MessagePriority.HIGH));
  }

  public static subscribe(code: string, handler: IMessageHandler) {
    MessageBus.addSubscription(code, handler);
  }

  public static unsubscribe(code: string, handler: IMessageHandler) {
    MessageBus.removeSubscription(code, handler);
  }
}