import { Scheduler, _destroyedScheduler, _flush } from './scheduler';
import { throttle } from './throttle.scheduler';

export function idleCallback(options?: IdleRequestOptions): Scheduler {
  if (!window.requestIdleCallback) return throttle(100);

  const tasks = new Set<() => void>();
  let destroyed = false;
  let pending: number | undefined;

  const handle = (deadline: IdleDeadline) => {
    pending = undefined;
    if (deadline.didTimeout) {
      return _flush(tasks);
    }
    try {
      while (deadline.timeRemaining() > 0 && tasks.size > 0) {
        const task = tasks.values().next().value;
        tasks.delete(task);
        task();
      }
    } finally {
      if (tasks.size > 0) {
        pending = requestIdleCallback(handle, options);
      }
    }
  };

  return {
    enqueue(task) {
      if (destroyed) throw _destroyedScheduler();
      tasks.add(task);

      if (pending) return;
      pending = requestIdleCallback(handle, options);
    },
    destroy() {
      destroyed = true;
      if (pending !== undefined) {
        cancelIdleCallback(pending);
      }
    },
  };
}
