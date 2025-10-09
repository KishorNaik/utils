import {
	createClient,
	RedisClientType,
	RedisFunctions,
	RedisModules,
	RedisScripts,
	RespVersions,
	TypeMapping,
} from 'redis';
import { logger } from '../loggers';
import { Ok, Result } from 'neverthrow';
import { ResultError } from '../../exceptions/results';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';
import CircuitBreaker from 'opossum';
import { ResultFactory, ExceptionsWrapper } from '../../miscellaneous/response';
import { IServiceHandlerAsync } from '../services';
import winston from 'winston';

export interface IRedisConnectionOptions {
	host: string;
	port: number;
	username?: string;
	password?: string;
	db?: number;
}

const circuitBreakerOptions = {
	timeout: 5000, // If Redis takes longer than 5 seconds, trigger a failure
	errorThresholdPercentage: 50, // If 50% of requests fail, open the circuit
	resetTimeout: 10000, // After 10 seconds, attempt to close the circuit
	maxFailures: 3, // Number of failures before the circuit opens
};

async function redisOperation(redisHelper: RedisHelper, cacheKey: string) {
	//Testing:
	//throw new Error(`Redis error: ${cacheKey}`);
	//return 'test';
	const cacheValueResult = await redisHelper.get(cacheKey);
	if (cacheValueResult.isErr()) {
		if (cacheValueResult.error.statusCode === StatusCodes.NOT_FOUND) {
			return null;
		}
		throw new Error(`Redis error: ${cacheValueResult.error.message}`);
	}
	return cacheValueResult.value;
}

export const redisCacheCircuitBreaker = new CircuitBreaker(redisOperation, circuitBreakerOptions);

@Service()
export class RedisHelper {
	//private client: RedisClientType;
	private client?: RedisClientType<
		RedisModules,
		RedisFunctions,
		RedisScripts,
		RespVersions,
		TypeMapping
	>;
	private connectionPromise: Promise<void> | null = null;
	private isConnected: boolean = false;

	public init(options: IRedisConnectionOptions): Promise<void> {
		if (this.connectionPromise) {
			return this.connectionPromise;
		}

		this.connectionPromise = (async () => {
			const url: string | undefined =
				options.username && options.password
					? `redis://${options.username}:${options.password}@${options.host}:${options.port}`
					: undefined;

			const clientOptions = url ? { url, database: options.db ?? undefined } : {};

			this.client = createClient(clientOptions)
				.on('error', (err) => {
					this.isConnected = false;
					console.log('Redis Client Error', err);
					logger.error(`Redis Client Error: ${err}`);
				})
				.on('ready', () => {
					this.isConnected = true;
					console.log('Redis Client Ready');
					logger.info('Redis Client Ready');
				})
				.on('end', () => {
					this.isConnected = false;
					console.log('Redis Client End');
					logger.info('Redis Client End');
				});

			await this.client.connect();
		})();

		return this.connectionPromise;
	}

	public async get(key: string): Promise<Result<string | null | undefined, ResultError>> {
		if (!this.isConnected)
			return ResultFactory.error(
				StatusCodes.SERVICE_UNAVAILABLE,
				'Redis Client Not Connected'
			);

		if (!key) return ResultFactory.error(StatusCodes.BAD_REQUEST, 'Key is required');
		const data = await this.client?.get(key);
		if (!data) return ResultFactory.error(StatusCodes.NOT_FOUND, 'data not found');
		return new Ok(data);
	}

	public async set(key: string, value: string): Promise<Result<undefined, ResultError>> {
		if (!this.isConnected)
			return ResultFactory.error(
				StatusCodes.SERVICE_UNAVAILABLE,
				'Redis Client Not Connected'
			);
		if (!key) return ResultFactory.error(StatusCodes.BAD_REQUEST, 'Key is required');
		if (!value) return ResultFactory.error(StatusCodes.BAD_REQUEST, 'Value is required');

		await this.client?.set(key, value);
		return new Ok(undefined);
	}

	public async disconnect(): Promise<void> {
		if (this.isConnected && this.client) {
			await this.client.quit();
			this.isConnected = false;
		}
	}
}

// #region Redis Wrapper

export interface IRedisStoreWrapperParameters<TParams> {
	key: string;
	setParams: TParams;
}

export type RowVersionNumber = number;

export interface IRedisStoreWrapper<TParams extends object, TResult extends object>
	extends IServiceHandlerAsync<IRedisStoreWrapperParameters<TParams>, TResult> {}

/**
 * A type guard to validate the structure of the object retrieved from the cache.
 * It ensures the object is a valid object and contains a numeric 'version' property.
 * @param obj The object to validate.
 */
function isValidCacheObject<T extends object>(obj: any): obj is T & { version: number } {
	return (
		obj !== null &&
		typeof obj === 'object' &&
		!Array.isArray(obj) &&
		typeof (obj as any).version === 'number'
	);
}

export abstract class RedisStoreWrapper<TParams extends object, TResult extends object>
	implements IRedisStoreWrapper<TParams, TResult>
{
	private readonly _redisHelper: RedisHelper;
	private readonly _logger: winston.Logger;
	private readonly _redisConnectionOptions: IRedisConnectionOptions;

	public constructor(
		redisHelper: RedisHelper,
		redisConnectionOptions: IRedisConnectionOptions,
		logger: winston.Logger
	) {
		this._redisHelper = redisHelper;
		this._redisConnectionOptions = redisConnectionOptions;
		this._logger = logger;
	}

	/**
	 * Fetches data from the primary data source and stores it in the cache.
	 * This method is reused for initial cache sets, stale cache updates, and fallbacks.
	 * @param key The cache key.
	 * @param params The parameters for fetching the data.
	 * @returns A success result with the fresh data, even if caching fails.
	 */
	private async fetchAndSetCache(
		key: string,
		params: TParams
	): Promise<Result<TResult, ResultError>> {
		// 1. Get fresh data from the abstract source
		if (!this.setCacheDataAsync) {
			return ResultFactory.error(
				StatusCodes.NOT_IMPLEMENTED,
				`setCacheDataAsync is not implemented`
			);
		}
		const sourceResult = await this.setCacheDataAsync(params);
		if (sourceResult.isErr()) {
			return ResultFactory.errorInstance(sourceResult.error);
		}
		if (!sourceResult.value) {
			return ResultFactory.error(StatusCodes.NOT_FOUND, `data is not found`);
		}

		const result = sourceResult.value;
		this._logger.info(`RedisStoreWrapper: Fetched data from source for key: ${key}`);

		if (!isValidCacheObject<TResult>(result)) {
			const errorMessage = `RedisStoreWrapper: Source data for key: ${key} is invalid or malformed (e.g., missing 'version' property). The data will be returned but not cached.`;
			this._logger.warn(errorMessage);
			// Return the data without attempting to cache it.
			return ResultFactory.error(
				StatusCodes.NOT_FOUND,
				`missing 'version' property in the entity`
			);
		}

		// 2. Attempt to set the fresh data in Redis
		const setRedisCacheResult = await this._redisHelper.set(key, JSON.stringify(result));
		if (setRedisCacheResult.isErr()) {
			this._logger.error(
				`RedisStoreWrapper: Failed to set cache for key: ${key}. Returning fresh data without caching.`,
				setRedisCacheResult.error
			);
		}

		// 3. Always return the fresh data, even if caching failed
		return ResultFactory.success(result);
	}

	/**
	 * Retrieves and validates a value from the Redis cache using the circuit breaker.
	 * @param key The cache key.
	 * @returns The parsed and validated cache object, or null if not found or invalid.
	 */
	private async getCacheValue(key: string): Promise<(TResult & { version: number }) | null> {
		const cacheValueResult = await redisCacheCircuitBreaker.fire(this._redisHelper, key);
		if (!cacheValueResult) {
			this._logger.info(`RedisStoreWrapper: Cache miss for key: ${key}`);
			return null;
		}

		try {
			const parsedResult = JSON.parse(cacheValueResult);

			// Validate the structure of the cached object
			if (!isValidCacheObject<TResult>(parsedResult)) {
				this._logger.warn(
					`RedisStoreWrapper: Invalid or malformed object found in cache for key: ${key}. Discarding.`
				);
				return null;
			}

			this._logger.info(`RedisStoreWrapper: Cache hit for key: ${key}`);
			return parsedResult;
		} catch (e) {
			this._logger.error(
				`RedisStoreWrapper: Failed to parse JSON from cache for key: ${key}. Discarding.`,
				e
			);
			return null;
		}
	}

	/**
	 * Handles the logic for a cache hit, including version validation.
	 * @param cachedResult The data retrieved from the cache.
	 * @param setParams The parameters for fetching fresh data if needed.
	 * @param key The cache key.
	 * @returns A result containing either the valid cached data or fresh data if the cache was stale.
	 */
	private async handleCacheHit(
		cachedResult: TResult & { version: number },
		setParams: TParams,
		key: string
	): Promise<Result<TResult, ResultError>> {
		if (!this.getRowVersionAsync) {
			return ResultFactory.error(
				StatusCodes.NOT_IMPLEMENTED,
				`getRowVersionAsync is not implemented`
			);
		}

		const rowVersionResult = await this.getRowVersionAsync(setParams);
		if (rowVersionResult.isErr()) {
			return ResultFactory.errorInstance(rowVersionResult.error);
		}
		if (rowVersionResult.value === undefined || rowVersionResult.value === null) {
			return ResultFactory.error(
				StatusCodes.NOT_FOUND,
				`No version number found from source`
			);
		}

		const sourceVersion = rowVersionResult.value as RowVersionNumber;

		// If cache version matches the source version, the cache is fresh
		if (cachedResult.version === sourceVersion) {
			this._logger.info(`RedisStoreWrapper: Cache version is fresh for key: ${key}`);
			return ResultFactory.success(cachedResult);
		}

		// Otherwise, the cache is stale; fetch new data and update the cache
		this._logger.info(`RedisStoreWrapper: Stale cache detected for key: ${key}. Re-fetching.`);
		return this.fetchAndSetCache(key, setParams);
	}

	public async handleAsync(
		params: IRedisStoreWrapperParameters<TParams>
	): Promise<Result<TResult, ResultError>> {
		// Guard clauses
		if (!params?.key) return ResultFactory.error(StatusCodes.BAD_REQUEST, `key is required`);
		if (!this._redisHelper)
			return ResultFactory.error(
				StatusCodes.BAD_REQUEST,
				`redis helper object is not initiated`
			);
		if (!this._logger)
			return ResultFactory.error(StatusCodes.BAD_REQUEST, `logger object is not initiated`);

		const { key, setParams } = params;

		try {
			// Ensure Redis is connected (this is now an idempotent operation)
			await this._redisHelper.init(this._redisConnectionOptions);

			// 1. Attempt to get the value from the cache
			const cachedValue = await this.getCacheValue(key);

			// 2. Handle Cache Miss
			if (!cachedValue) {
				return this.fetchAndSetCache(key, setParams);
			}

			// 3. Handle Cache Hit (and check for stale data)
			return this.handleCacheHit(cachedValue, setParams, key);
		} catch (ex) {
			const error = ex as Error;
			this._logger.error(
				`RedisStoreWrapper: An unexpected error occurred. Falling back to direct data source for key: ${key}`,
				error
			);

			// Fallback logic: If Redis fails completely, get data directly from the source.
			// Note: This now returns a SUCCESS result with the fallback data.
			const fallbackResult = await this.fetchAndSetCache(key, setParams);
			if (fallbackResult.isErr()) {
				// If the fallback itself fails, return that error.
				return ResultFactory.error(
					fallbackResult.error.statusCode,
					fallbackResult.error.message,
					undefined, // No data to return
					error.stack // Include original Redis error stack
				);
			}
			// Return the successful fallback data
			return fallbackResult;
		}
	}

	protected abstract setCacheDataAsync(params: TParams): Promise<Result<TResult, ResultError>>;

	protected abstract getRowVersionAsync(
		params: TParams
	): Promise<Result<RowVersionNumber, ResultError>>;
}
// #endregion
