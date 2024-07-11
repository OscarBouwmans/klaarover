import { Scheduler, _destroyedScheduler, _flush } from './scheduler';

export function throttle(minimumInterval: number): Scheduler {
  const tasks = new Set<() => void>();
  let destroyed = false;
  let waitUntil: Date | undefined;
  let pending: number | undefined;

  return {
    enqueue(task) {
      if (destroyed) throw _destroyedScheduler();
      tasks.add(task);
      if (!waitUntil) {
        queueMicrotask(() => {
          waitUntil = new Date(Date.now() + minimumInterval);
          _flush(tasks);
        });
        return;
      }
      if (pending) return;
      pending = setTimeout(() => {
        waitUntil = undefined;
        pending = undefined;
        _flush(tasks);
      }, waitUntil.getTime() - Date.now());
    },
    destroy() {
      destroyed = true;
      if (pending !== undefined) {
        clearTimeout(pending);
      }
    },
  };
}
