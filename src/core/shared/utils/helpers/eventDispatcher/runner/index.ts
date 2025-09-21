import { WorkerEventDispatcher } from '../types';

export class EventDispatcherRunner {
	private _workers: WorkerEventDispatcher[] = [];

	public registerWorker(worker: WorkerEventDispatcher) {
		this._workers.push(worker);
	}

	public unregisterWorker(worker: WorkerEventDispatcher) {
		this._workers.splice(this._workers.indexOf(worker), 1);
	}

	public get count(): number {
		return this._workers?.length ?? 0;
	}

	public async runWorkers(): Promise<void> {
		await Promise.all(this._workers.map((worker) => worker()));
	}
}
