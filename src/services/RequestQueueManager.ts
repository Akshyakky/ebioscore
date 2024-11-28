export class RequestQueueManager {
  private queue: Map<string, Promise<any>> = new Map();

  async enqueue<T>(key: string, request: () => Promise<T>): Promise<T> {
    // If there's already a request in progress with this key, return that promise
    if (this.queue.has(key)) {
      return this.queue.get(key);
    }

    // Create new request promise
    const promise = request().finally(() => {
      this.queue.delete(key);
    });

    // Store in queue
    this.queue.set(key, promise);

    return promise;
  }

  clearQueue(): void {
    this.queue.clear();
  }
}
