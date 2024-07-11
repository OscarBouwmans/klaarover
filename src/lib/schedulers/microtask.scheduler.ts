import { Scheduler, _destroyedScheduler, _flush } from './scheduler';

export function microtask(): Scheduler {
  const tasks = new Set<() => void>();
  let destroyed = false;
  let isPending = false;
  return {
    enqueue(task) {
      if (destroyed) throw _destroyedScheduler();
      tasks.add(task);

      if (isPending) return;
      isPending = true;
      queueMicrotask(() => {
        if (destroyed) return;
        isPending = false;
        _flush(tasks);
      });
    },
    destroy() {
      destroyed = true;
    },
  };
}
