import { StatusCodes } from 'http-status-codes';
import { EventDispatcher } from '../../../core';
import { ReplyMessageEventDispatcher, RequestReplyMessageEventDispatcher } from '../../../types';

export class RequestReplyConsumerEventDispatcher {
	constructor(private dispatcher: EventDispatcher) {}

	public async startConsumingAsync<TRequest, TReply>(
		eventType: string,
		handler: (
			event: RequestReplyMessageEventDispatcher<TRequest>
		) => ReplyMessageEventDispatcher<TReply> | Promise<ReplyMessageEventDispatcher<TReply>>
	): Promise<void> {
		if (!eventType) throw new Error('Event type is required');
		if (!handler) throw new Error('Handler is required');

		await this.dispatcher.onRequest(
			eventType,
			async (event: RequestReplyMessageEventDispatcher<TRequest>) => {
				const replyType = `reply:${event.correlationId}`;

				const reply = await handler(event);
				await this.dispatcher.publishReply(replyType, reply);
			}
		);
	}
}
