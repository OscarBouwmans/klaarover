export interface Scheduler {
  enqueue(task: () => void): void;
  destroy(): void;
}

export const _destroyedScheduler = () =>
  new Error('Destroyed scheduler may no longer enqueue tasks.');

export const _flush = (tasks: Set<() => void>) => {
  tasks.forEach((task) => task());
  tasks.clear();
};
