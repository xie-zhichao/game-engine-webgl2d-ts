import { IMessageHandler } from "./IMessageHandler";
import { MessageSubscriptionNode } from "./messageSubscriptionNode";
import { Message, MessagePriority } from "./message";

export class MessageBus {
  private static subscriptions: { [code: string]: IMessageHandler[] } = {};

  private static normalQueueMessagePerUpdate: number = 10;
  private static normalMessageQueue: MessageSubscriptionNode[] = [];

  private constructor() { }

  public static addSubscription(code: string, handler: IMessageHandler): void {
    if (MessageBus.subscriptions[code] === undefined) {
      MessageBus.subscriptions[code] = [];
    }

    if (MessageBus.subscriptions[code].indexOf(handler) !== -1) {
      console.log(`Attempting to add a duplicate handler to code: ${code}, subscription not added.`)
    }else{
      MessageBus.subscriptions[code].push(handler);
    }
  }

  public static removeSubscription(code: string, handler: IMessageHandler):void {
    if(MessageBus.subscriptions[code] === undefined) {
      console.warn(`Cannot unsubscribe handler from code: ${code}, this code is not subscribed.`)
      return;
    }

    const nodeIndex = MessageBus.subscriptions[code].indexOf(handler);
    if(nodeIndex !== -1) {
      MessageBus.subscriptions[code].splice(nodeIndex, 1);
    }
  }
  
  public static post(message: Message) {
    console.log('Message posted:', message);
    const handlers = MessageBus.subscriptions[message.code];
    if(handlers === undefined) {
      return;
    }

    for(const h of handlers) {
      if(message.priority === MessagePriority.HIGH) {
        h.onMessage(message);
      } else {
        MessageBus.normalMessageQueue.push(new MessageSubscriptionNode(message, h));
      }
    }
  }

  public static update(_time: number):void {
    if(MessageBus.normalMessageQueue.length === 0) {
      return;
    }

    const messageLimit = Math.min(MessageBus.normalQueueMessagePerUpdate ,MessageBus.normalMessageQueue.length);
    for(let i=0; i<messageLimit; i++) {
      const node = MessageBus.normalMessageQueue.pop();
      node && node.handler.onMessage(node.message);
    }
  }
}
