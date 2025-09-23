import { EventDispatcher } from '../../../core';
import { ReplayableEventDispatcher, SendReceiverMessageEventDispatcher } from '../../../types';

export class SendReceiverProducerEventDispatcher {
	constructor(private dispatcher: EventDispatcher) {}

	public async sendAsync<T>(
		eventType: string,
		data: SendReceiverMessageEventDispatcher<T>,
		replayable: ReplayableEventDispatcher = ReplayableEventDispatcher.NO
	): Promise<void> {
		if (!eventType) throw new Error('Event type is required');
		if (!data) throw new Error('Data is required');

		await this.dispatcher.publish(
			eventType,
			data,
			replayable === ReplayableEventDispatcher.YES
		);
	}
}
