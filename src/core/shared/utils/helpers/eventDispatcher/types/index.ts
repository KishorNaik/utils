import { StatusCodes } from 'http-status-codes';

export enum ReplayableEventDispatcher {
	YES = 'YES',
	NO = 'NO',
}

export interface SendReceiverMessageEventDispatcher<T> {
	data: T;
	traceId?: string;
	correlationId?: string;
	timestamp?: string;
}

export interface RequestReplyEventDispatcher<T> {
	data: T;
	traceId?: string;
	correlationId?: string;
	timestamp?: string;
}

export interface ReplyMessageEventDispatcher<T> {
	correlationId?: string;
	success: boolean;
	data?: T;
	message?: string; // Optional message for success or error
	error?: string;
	traceId?: string;
	timestamp?: string; // ISO 8601 format
	statusCode?: StatusCodes;
}

export type WorkerEventDispatcher = () => Promise<void>;
