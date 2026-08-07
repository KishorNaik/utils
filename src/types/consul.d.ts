declare module 'consul' {
	export interface ConsulOptions {
		host?: string;
		port?: number;
		secure?: boolean;
		defaults?: Record<string, unknown>;
	}

	export interface RegisterOptions {
		[key: string]: unknown;
	}

	export interface DeregisterOptions {
		[key: string]: unknown;
	}

	export interface ConsulAgentService {
		register(options: RegisterOptions): Promise<unknown>;
		deregister(options: DeregisterOptions): Promise<unknown>;
	}

	export interface ConsulAgent {
		service: ConsulAgentService;
	}

	export interface ConsulHealth {
		service(params: { service: string; passing: boolean }): Promise<unknown[]>;
	}

	class Consul {
		constructor(options?: ConsulOptions);
		agent: ConsulAgent;
		health: ConsulHealth;
	}

	export default Consul;
}

declare module 'consul/lib/agent/service.js' {
	export interface RegisterOptions {
		[key: string]: unknown;
	}

	export interface DeregisterOptions {
		[key: string]: unknown;
	}
}
