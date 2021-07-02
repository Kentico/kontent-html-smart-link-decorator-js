import { isInsideIFrame } from '../utils/iframe';
import { EventManager } from './EventManager';
import {
  IAddActionMessageData,
  IAddButtonInitialMessageData,
  IAddButtonPermissionsServerModel,
  IClickedMessageMetadata,
  IContentComponentClickedMessageData,
  IContentItemClickedMessageData,
  IElementClickedMessageData,
  IFrameMessageType,
  IRefreshMessageData,
  IRefreshMessageMetadata,
  ISDKInitializedMessageData,
  ISDKStatusMessageData,
} from './IFrameCommunicatorTypes';
import { createUuid } from '../utils/createUuid';
import { InvalidEnvironmentError } from '../utils/errors';

type Callback<TResponseData = undefined> = (data?: TResponseData) => void;
type MessageSignature<TMessageData, TMessageMetaData = undefined, TMessageCallback = undefined> = (
  data: TMessageData,
  metadata: TMessageMetaData,
  callback: TMessageCallback
) => void;

export type IFrameMessagesMap = {
  readonly [IFrameMessageType.Initialized]: MessageSignature<
    ISDKInitializedMessageData,
    undefined,
    Callback<undefined>
  >;
  readonly [IFrameMessageType.Status]: MessageSignature<ISDKStatusMessageData>;
  readonly [IFrameMessageType.ElementClicked]: MessageSignature<IElementClickedMessageData, IClickedMessageMetadata>;
  readonly [IFrameMessageType.ContentItemClicked]: MessageSignature<
    IContentItemClickedMessageData,
    IClickedMessageMetadata
  >;
  readonly [IFrameMessageType.ContentComponentClicked]: MessageSignature<
    IContentComponentClickedMessageData,
    IClickedMessageMetadata
  >;
  readonly [IFrameMessageType.AddInitial]: MessageSignature<
    IAddButtonInitialMessageData,
    IClickedMessageMetadata,
    Callback<IAddButtonPermissionsServerModel>
  >;
  readonly [IFrameMessageType.AddAction]: MessageSignature<IAddActionMessageData, IClickedMessageMetadata>;
  readonly [IFrameMessageType.Refresh]: MessageSignature<IRefreshMessageData, IRefreshMessageMetadata>;
};

export interface IFrameMessage<E extends keyof IFrameMessagesMap> {
  readonly type: E;
  readonly data: Parameters<IFrameMessagesMap[E]>[0];
  readonly metadata?: Parameters<IFrameMessagesMap[E]>[1];
  readonly requestId?: string;
}

export class IFrameCommunicator {
  private readonly events: EventManager<IFrameMessagesMap> = new EventManager<IFrameMessagesMap>();
  private readonly callbacks: Map<string, Callback<any>> = new Map();

  public initialize(): void {
    window.addEventListener('message', this.onMessage, true);
  }

  public destroy(): void {
    this.events.removeAllListeners();
    window.removeEventListener('message', this.onMessage, true);
  }

  public addMessageListener = <M extends keyof IFrameMessagesMap>(type: M, listener: IFrameMessagesMap[M]): void => {
    this.events.on(type, listener);
  };

  public removeMessageListener = <M extends keyof IFrameMessagesMap>(type: M, listener: IFrameMessagesMap[M]): void => {
    this.events.off(type, listener);
  };

  public sendMessageWithResponse = <M extends keyof IFrameMessagesMap>(
    type: M,
    data: Parameters<IFrameMessagesMap[M]>[0],
    callback: Parameters<IFrameMessagesMap[M]>[2],
    metadata?: Parameters<IFrameMessagesMap[M]>[1]
  ): void => {
    const requestId = createUuid();
    this.registerCallback(requestId, callback);
    this.sendMessage(type, data, metadata, requestId);
  };

  public sendMessage = <M extends keyof IFrameMessagesMap>(
    type: M,
    data: Parameters<IFrameMessagesMap[M]>[0],
    metadata?: Parameters<IFrameMessagesMap[M]>[1],
    requestId?: string
  ): void => {
    if (!isInsideIFrame()) {
      throw InvalidEnvironmentError('IFrameCommunicator: iframe message can only be send while inside iframe.');
    }

    const message: IFrameMessage<M> = { type, data, metadata, requestId };
    window.parent.postMessage(message, '*');
  };

  private onMessage = (event: MessageEvent): void => {
    if (!event.data) return;
    const message = event.data as IFrameMessage<any>;
    this.events.emit(message.type, message.data);

    if (message.requestId) {
      this.executeCallback(message.requestId, message.data);
    }
  };

  private registerCallback = (requestId: string, callback?: Callback<any>): void => {
    if (!callback) {
      return;
    }

    this.callbacks.set(requestId, callback);
  };

  private executeCallback = <T>(requestId: string, data: T): void => {
    const callback = this.callbacks.get(requestId);

    if (callback) {
      callback(data);

      this.callbacks.delete(requestId);
    }
  };
}
