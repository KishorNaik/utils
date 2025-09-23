import { StatusCodes } from 'http-status-codes';
import {
	DataResponse,
	PaginationDataResponseModel,
} from '../../../../models/response/data.Response';
import { PipelineWorkflowException } from '../../../helpers/workflow';
import { QueryRunner } from 'typeorm';

export class DataResponseFactory {
	static response<TData>(
		success?: boolean,
		statusCode?: StatusCodes,
		data?: TData,
		message?: string,
		pagination?: PaginationDataResponseModel,
		traceId?: string,
		metaData?: unknown
	): DataResponse<TData> {
		return {
			success: success,
			statusCode: statusCode,
			data: data,
			message: message,
			pagination: pagination,
			timestamp: new Date().toISOString(),
			traceId: traceId,
			metaData: metaData,
		};
	}

	public static success<TData>(
		statusCode?: StatusCodes,
		data?: TData,
		message?: string,
		pagination?: PaginationDataResponseModel,
		traceId?: string,
		metaData?: unknown
	): DataResponse<TData> {
		return {
			success: true,
			statusCode: statusCode,
			data: data,
			message: message,
			pagination: pagination,
			timestamp: new Date().toISOString(),
			traceId: traceId,
			metaData: metaData,
		};
	}

	public static error<TData>(
		statusCode?: StatusCodes,
		message?: string,
		pagination?: PaginationDataResponseModel,
		traceId?: string,
		metaData?: unknown
	): DataResponse<TData> {
		return {
			success: false,
			statusCode: statusCode,
			data: undefined,
			message: message,
			pagination: pagination,
			timestamp: new Date().toISOString(),
			traceId: traceId,
			metaData: metaData,
		};
	}

	public static async pipelineError<TData>(
		error: Error | PipelineWorkflowException,
		queryRunner?: QueryRunner,
		traceId?: string,
		metaData?: unknown
	): Promise<DataResponse<TData>> {
		if (queryRunner?.isTransactionActive) {
			console.log(`queryRunner.isTransactionActive: ${queryRunner.isTransactionActive}`);
			await queryRunner.rollbackTransaction();
		}

		if (error instanceof PipelineWorkflowException)
			return DataResponseFactory.error(
				error.statusCode,
				error.message,
				undefined,
				traceId,
				metaData
			);

		return DataResponseFactory.error(
			StatusCodes.INTERNAL_SERVER_ERROR,
			error.message ?? 'Unexpected error',
			undefined,
			traceId,
			metaData
		);
	}
}
