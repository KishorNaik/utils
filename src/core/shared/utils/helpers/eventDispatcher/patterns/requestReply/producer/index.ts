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

		return new Promise<ReplyMessageEventDispatcher<TReply>>((resolve, reject) => {
			const replyHandler = async (
				reply: ReplyMessageEventDispatcher<TReply>
			): Promise<void> => {
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

			this.dispatcher.onReplyOnce(replyType, replyHandler);
			this.dispatcher.publishRequest(eventType, data);
		});
	}
}
