import { ComponentInstance, component } from '../component';
import { renderBefore } from '../render';

export interface LazyOptions {
  loader: () => ComponentInstance | Promise<ComponentInstance>;
  strategy: ReturnType<LazyStrategy>;
  placeholder?: ComponentInstance;
}

export type LazyStrategy<Options extends any[] = []> = (
  ...options: Options
) => () => {
  load: Promise<any>;
  cancel?: () => void;
};

export const Lazy = component<LazyOptions>(
  '<!---->',
  ({ loader, strategy, placeholder }, { lifecycle, fragment }) => {
    const insertionPoint = fragment.childNodes[0];

    let instance: ComponentInstance | undefined;

    async function didMount() {
      if (lifecycle.aborted) return;
      if (placeholder) {
        renderBefore(insertionPoint, placeholder);
      }
      const { load, cancel } = strategy();
      if (typeof cancel === 'function') {
        lifecycle.addEventListener('abort', () => cancel(), { once: true });
      }
      await load;
      if (lifecycle.aborted) {
        return;
      }
      instance = await loader();
      if (lifecycle.aborted) {
        return instance.destroy();
      }
      placeholder?.destroy();
      renderBefore(insertionPoint, instance);
      insertionPoint.remove();
    }

    return {
      mounted() {
        didMount();
      },
      cleanup() {
        placeholder?.destroy();
        instance?.destroy();
      },
    };
  }
);

export const delay: LazyStrategy<[delay: number]> = (delay) => {
  return () => {
    let timer: number;
    return {
      load: new Promise((resolve) => {
        timer = setTimeout(resolve, delay);
      }),
      cancel: () => clearTimeout(timer),
    };
  };
};

export const trigger: LazyStrategy<
  [trigger: Promise<any>, cancel?: () => void]
> = (load, cancel) => {
  return () => ({ load, cancel });
};

export const idleTime: LazyStrategy<[options?: IdleRequestOptions]> = (
  options
) => {
  return () => {
    let handle: number;
    return {
      load: new Promise((resolve) => {
        handle = requestIdleCallback(resolve, options);
      }),
      cancel: () => cancelIdleCallback(handle),
    };
  };
};
