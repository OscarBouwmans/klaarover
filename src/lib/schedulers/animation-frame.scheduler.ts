import { Scheduler, _destroyedScheduler, _flush } from './scheduler';

export function animationFrame(): Scheduler {
  const tasks = new Set<() => void>();
  let destroyed = false;
  let pending: number | undefined;
  return {
    enqueue(task) {
      if (destroyed) throw _destroyedScheduler();
      tasks.add(task);

      pending ??= requestAnimationFrame(() => {
        pending = undefined;
        _flush(tasks);
      });
    },
    destroy() {
      destroyed = true;
      if (pending !== undefined) {
        cancelAnimationFrame(pending);
      }
    },
  };
}
