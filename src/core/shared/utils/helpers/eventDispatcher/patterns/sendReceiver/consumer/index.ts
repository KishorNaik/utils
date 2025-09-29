import { EventDispatcher } from '../../../core';
import { SendReceiverMessageEventDispatcher } from '../../../types';

export class SendReceiverConsumerEventDispatcher {
	private handlerMap = new Map<
		string,
		Map<(event: any) => Promise<void>, (event: any) => Promise<void>>
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

		if (!this.handlerMap.has(eventType)) {
			this.handlerMap.set(
				eventType,
				new Map<(event: any) => Promise<void>, (event: any) => Promise<void>>()
			);
		}

		const wrapped = async (event: SendReceiverMessageEventDispatcher<T>) => {
			await handler(event);
		};

		this.handlerMap.get(eventType)!.set(handler, wrapped);
		await this.dispatcher.subscribe(eventType, wrapped);
	}

	public async unsubscribe<T>(
		eventType: string,
		handler: (event: SendReceiverMessageEventDispatcher<T>) => Promise<void>
	): Promise<void> {
		const eventHandlers = this.handlerMap.get(eventType);
		if (!eventHandlers) {
			throw new Error(`No handlers found for event: ${eventType}`);
		}

		const wrapped = eventHandlers.get(handler);
		if (!wrapped) {
			throw new Error(`Handler not subscribed to event: ${eventType}`);
		}

		await this.dispatcher.unsubscribe(eventType, wrapped);
		eventHandlers.delete(handler);

		if (eventHandlers.size === 0) {
			this.handlerMap.delete(eventType);
		}
	}
}
