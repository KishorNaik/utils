import { EventDispatcher } from '../../../core';
import { SendReceiverMessageEventDispatcher } from '../../../types';

export class SendReceiverConsumerEventDispatcher {
	private handlerMap = new Map<
		string,
		(event: SendReceiverMessageEventDispatcher<any>) => Promise<void>
	>();

	constructor(private dispatcher: EventDispatcher) {}

	public async subscribeOnce<T>(
		eventType: string,
		handler: (event: SendReceiverMessageEventDispatcher<T>) => Promise<void>
	): Promise<void> {
		if (!eventType) throw new Error('Event type is required');
		if (!handler) throw new Error('Handler is required');

		await this.dispatcher.subscribeOnce(
			eventType,
			async (event: SendReceiverMessageEventDispatcher<T>) => {
				await handler(event);
			}
		);
	}

	public async subscribe<T>(
		eventType: string,
		handler: (event: SendReceiverMessageEventDispatcher<T>) => Promise<void>
	): Promise<void> {
		if (!eventType) throw new Error('Event type is required');
		if (!handler) throw new Error('Handler is required');

		const wrapped = async (event: SendReceiverMessageEventDispatcher<T>) => {
			await handler(event);
		};
		this.handlerMap.set(eventType, wrapped);
		await this.dispatcher.subscribe(eventType, wrapped);
	}

	public async unsubscribe<T>(eventType: string): Promise<void> {
		const wrapped = this.handlerMap.get(eventType);
		if (!wrapped) throw new Error(`No handler found for event: ${eventType}`);

		await this.dispatcher.unsubscribe(eventType, wrapped);
		this.handlerMap.delete(eventType);
	}
}
