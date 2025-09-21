import { EventDispatcher } from '../../../core';
import { ReplyMessageEventDispatcher, RequestReplyEventDispatcher } from '../../../types';

export class RequestReplyProducerEventDispatcher {
	constructor(private dispatcher: EventDispatcher) {}

	public async sendAsync<TRequest, TReply>(
		eventType: string,
		data: TRequest,
		meta: Partial<RequestReplyEventDispatcher<TRequest>>
	): Promise<ReplyMessageEventDispatcher<TReply>> {
		if (!eventType) throw new Error('Event type is required');
		if (!data) throw new Error('Data is required');
		if (!meta) throw new Error('Meta is required');

		const correlationId = meta?.correlationId ?? crypto.randomUUID();
		const traceId = meta?.traceId ?? crypto.randomUUID();
		const timestamp = meta?.timestamp ?? new Date().toISOString();
		const replyType = `reply:${correlationId}`;

		const event: RequestReplyEventDispatcher<TRequest> = {
			data,
			correlationId,
			traceId,
			timestamp,
		};

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
			this.dispatcher.publishRequest(eventType, event);
		});
	}
}
