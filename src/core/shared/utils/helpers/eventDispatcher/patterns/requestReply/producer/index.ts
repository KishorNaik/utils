import { EventDispatcher } from '../../../core';
import { ReplyMessageEventDispatcher, RequestReplyMessageEventDispatcher } from '../../../types';

export class RequestReplyProducerEventDispatcher {
	constructor(private dispatcher: EventDispatcher) {}

	public async sendAsync<TRequest, TReply>(
		eventType: string,
		data: RequestReplyMessageEventDispatcher<TRequest>
	): Promise<ReplyMessageEventDispatcher<TReply>> {
		if (!eventType) throw new Error('Event type is required');
		if (!data) throw new Error('Data is required');

		const replyType = `reply:${data.correlationId}`;

		const timeout = data.timeout ?? 30000; // Default 30s timeout

		return new Promise<ReplyMessageEventDispatcher<TReply>>((resolve, reject) => {
			// eslint-disable-next-line no-undef
			let timeoutId: NodeJS.Timeout;

			const replyHandler = (reply: ReplyMessageEventDispatcher<TReply>): void => {
				clearTimeout(timeoutId);
				this.dispatcher.offReply(replyType, replyHandler);
				try {
					if (reply.success) {
						resolve(reply);
					} else {
						reject(reply.error ?? 'Unknown error');
					}
				} catch (err) {
					reject(err);
				}
			};

			timeoutId = setTimeout(() => {
				this.dispatcher.offReply(replyType, replyHandler);
				reject(new Error(`Request for event '${eventType}' timed out after ${timeout}ms`));
			}, timeout);

			this.dispatcher.onReply(replyType, replyHandler);
			this.dispatcher.publishRequest(eventType, data);
		});
	}
}
