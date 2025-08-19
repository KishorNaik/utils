import { ReasonPhrases, StatusCodes, getReasonPhrase, getStatusCode } from 'http-status-codes';

export class PaginationDataResponseModel {
	public currentPage?: number;
	public totalPages?: number;
	public pageSize?: number;
	public totalCount?: number;

	public hasPrevious?: boolean;
	public hasNext?: boolean;
}

export class DataResponse<TData> {
	success?: boolean;
	statusCode?: StatusCodes;
	data?: TData;
	message?: string;
	pagination?: PaginationDataResponseModel;
	timestamp?: string;
}
