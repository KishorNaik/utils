import { EventEmitter } from 'events';
import {
	ReplyMessageEventDispatcher,
	RequestReplyEventDispatcher,
	SendReceiverMessageEventDispatcher,
} from '../types';

export class EventDispatcher {
	private emitter = new EventEmitter();

	public async publish<T>(
		eventType: string,
		event: SendReceiverMessageEventDispatcher<T>
	): Promise<void> {
		this.emitter.emit(eventType, event);
	}

	public async subscribeOnce<T>(
		eventType: string,
		handler: (event: SendReceiverMessageEventDispatcher<T>) => Promise<void>
	): Promise<void> {
		this.emitter.once(eventType, async (event) => {
			await handler(event);
		});
	}

	public async subscribe<T>(
		eventType: string,
		handler: (event: SendReceiverMessageEventDispatcher<T>) => Promise<void>
	): Promise<void> {
		this.emitter.on(eventType, handler);
	}

	public async unsubscribe<T>(
		eventType: string,
		handler: (event: SendReceiverMessageEventDispatcher<T>) => Promise<void>
	): Promise<void> {
		this.emitter.off(eventType, handler);
	}

	public async publishRequest<T>(
		eventType: string,
		event: RequestReplyEventDispatcher<T>
	): Promise<void> {
		this.emitter.emit(eventType, event);
	}

	public async publishReply<T>(
		replyType: string,
		reply: ReplyMessageEventDispatcher<T>
	): Promise<void> {
		this.emitter.emit(replyType, reply);
	}

	public async onRequest<T>(
		eventType: string,
		handler: (event: RequestReplyEventDispatcher<T>) => Promise<void>
	): Promise<void> {
		this.emitter.on(eventType, async (event) => {
			await handler(event);
		});
	}

	public async onReplyOnce<T>(
		replyType: string,
		handler: (reply: ReplyMessageEventDispatcher<T>) => Promise<void>
	): Promise<void> {
		this.emitter.once(replyType, async (reply) => {
			await handler(reply);
		});
	}
}
