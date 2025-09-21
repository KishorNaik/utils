import { EventEmitter } from 'events';
import {
	ReplyMessageEventDispatcher,
	RequestReplyEventDispatcher,
	SendReceiverMessageEventDispatcher,
} from '../types';

const MAX_REPLAY_BUFFER = 100;

export class EventDispatcher {
	private emitter = new EventEmitter();
	private replayBuffer: Map<string, SendReceiverMessageEventDispatcher<any>[]> = new Map();

	public async publish<T>(
		eventType: string,
		event: SendReceiverMessageEventDispatcher<T>,
		replayable = false
	): Promise<void> {
		if (replayable) {
			const buffer = this.replayBuffer.get(eventType) ?? [];
			buffer.push(event);
			if (buffer.length > MAX_REPLAY_BUFFER) buffer.shift();
			this.replayBuffer.set(eventType, buffer);
		}
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
		handler: (event: SendReceiverMessageEventDispatcher<T>) => Promise<void>,
		replay = false
	): Promise<void> {
		this.emitter.on(eventType, async (event) => {
			await handler(event);
		});

		if (replay) {
			const buffer = this.replayBuffer.get(eventType);
			if (buffer) {
				for (const event of buffer) {
					await handler(event);
				}
			}
		}
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
