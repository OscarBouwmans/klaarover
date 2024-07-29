import { Signal } from 'signal-polyfill';
import { Binding } from './component';
import { Scheduler } from './schedulers/scheduler';
import { $computed, AnySignal } from './signals';

export function subscribe<T>(
  source: Binding<T>,
  next: (value: T, previousValue?: T) => void,
  lifecycle: AbortSignal,
  scheduler: Scheduler
) {
  if (isPromise(source)) {
    source.then((value) => {
      if (lifecycle.aborted) {
        return;
      }
      scheduler.enqueue(() => next(value));
    });
    return;
  }

  if (isSignal(source)) {
    const reader = $computed(() => source.get());

    let previousValue: T;
    let isPending = false;

    const watcher = new Signal.subtle.Watcher(() => {
      if (!isPending) {
        isPending = true;
        scheduler.enqueue(() => {
          if (lifecycle.aborted) return;
          isPending = false;
          const value = reader.get();
          next(value, previousValue);
          previousValue = value;
          watcher.watch(reader);
        });
      }
    });

    const value = reader.get();
    next(value);
    previousValue = value;
    watcher.watch(reader);

    lifecycle.addEventListener(
      'abort',
      () => {
        watcher.unwatch(reader);
      },
      { once: true }
    );
    return;
  }

  next(source);
}

function isPromise<T>(source: Binding<T>): source is Promise<T> {
  return (
    source && Object.prototype.toString.call(source) === '[object Promise]'
  );
}

function isSignal<T>(
  source: Binding<T>
): source is AnySignal<T> {
  return source instanceof Signal.State || source instanceof Signal.Computed;
}
