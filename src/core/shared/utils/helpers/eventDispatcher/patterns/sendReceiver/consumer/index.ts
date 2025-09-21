import { EventDispatcher } from '../../../core';
import { SendReceiverMessageEventDispatcher } from '../../../types';

export class SendReceiverConsumerEventDispatcher {
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
		handler: (event: SendReceiverMessageEventDispatcher<T>) => Promise<void>,
		replay = false
	): Promise<void> {
		if (!eventType) throw new Error('Event type is required');
		if (!handler) throw new Error('Handler is required');

		await this.dispatcher.subscribe(
			eventType,
			async (event: SendReceiverMessageEventDispatcher<T>) => {
				await handler(event);
			},
			replay
		);
	}
}
