import { EventDispatcher } from '../../../core';
import { ReplayableEventDispatcher, SendReceiverMessageEventDispatcher } from '../../../types';

export class SendReceiverProducerEventDispatcher {
	constructor(private dispatcher: EventDispatcher) {}

	public async sendAsync<T>(
		eventType: string,
		data: T,
		meta: Partial<SendReceiverMessageEventDispatcher<T>>,
		replayable: ReplayableEventDispatcher = ReplayableEventDispatcher.NO
	): Promise<void> {
		if (!eventType) throw new Error('Event type is required');
		if (!data) throw new Error('Data is required');
		if (!meta) throw new Error('Meta is required');

		const event: SendReceiverMessageEventDispatcher<T> = {
			data,
			traceId: meta?.traceId ?? crypto.randomUUID(),
			correlationId: meta?.correlationId ?? crypto.randomUUID(),
			timestamp: meta?.timestamp ?? new Date().toISOString(),
		};
		await this.dispatcher.publish(
			eventType,
			event,
			replayable === ReplayableEventDispatcher.YES
		);
	}
}
