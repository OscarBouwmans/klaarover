import { Signal } from 'signal-polyfill';
import { bind } from './bind';
import { Scheduler } from './schedulers/scheduler';
import { microtask } from './schedulers/microtask.scheduler';

export type Component<Props extends {}> = (
  props: keyof Props extends never ? void | Props : Props,
  options?: ComponentInstanceOptions
) => ComponentInstance;

type ComponentInit<Props extends {}> = (
  props: Readonly<Props>,
  utils: {
    lifecycle: AbortSignal;
    fragment: DocumentFragment;
  }
) => void | {
  bindings?: ComponentBindings;
  mounted?: ComponentMounted;
  cleanup?: ComponentCleanup;
};

type ComponentMounted = (parent: Node) => void;
type ComponentCleanup = () => void;

export type Binding<T> = T | Signal.State<T> | Signal.Computed<T> | Promise<T>;

export const $textContent = Symbol('textContent');
export const $child = Symbol('child');
export const $children = Symbol('children');

export type ComponentBindings = {
  [selector: string]: {
    [$textContent]?: Binding<string>;
    [$child]?: Binding<ComponentInstance | null>;
    [$children]?: Binding<ComponentInstance[]>;
    [attibute: string]: Binding<string | boolean | ((event: Event) => any)>;
  };
};

export type ComponentInstanceOptions = {
  scheduler?: Scheduler;
};

export type ComponentInstance = Readonly<{
  [$component]: true;
  [$didRender]: (parent: Node, nodes: Node[]) => void;
  fragment: DocumentFragment;
  destroy: () => void;
}>;

const $component = Symbol('Component');
export const $didRender = Symbol('Component did render');

export function component<Props extends {} = {}>(
  template: HTMLTemplateElement | string,
  logic: ComponentInit<Props> = () => {}
): Component<Props> {
  if (typeof template === 'string') {
    return component(wrap(template), logic);
  }

  return (
    props: Props | void = {} as any,
    { scheduler = microtask() }: ComponentInstanceOptions = {}
  ) => {
    const destroyCtrl = new AbortController();
    const lifecycle = destroyCtrl.signal;

    Object.freeze(props);

    const fragment = template.content.cloneNode(true) as DocumentFragment;

    const childNodes = new Set<Node>();
    const childComponents = new Set<ComponentInstance>();

    const { bindings, mounted, cleanup } =
      logic(props as Props, {
        lifecycle,
        fragment,
      }) ?? {};

    if (bindings) {
      bind(fragment, bindings, lifecycle, childComponents, scheduler);
    }

    const destroy = () => {
      if (lifecycle.aborted) {
        throw new Error('Component already destroyed');
      }
      destroyCtrl.abort();
      scheduler.destroy();

      // Destroy all children
      childComponents.forEach((child) => child.destroy());
      childComponents.clear();

      // Call the optionally provided cleanup function
      if (typeof cleanup === 'function') {
        cleanup();
      }

      // Remove fragments from the DOM
      for (const elmnt of childNodes) {
        elmnt.parentNode?.removeChild(elmnt);
      }
    };

    return Object.freeze({
      [$component]: true,
      [$didRender]: (parent, nodes) => {
        nodes.forEach((node) => childNodes.add(node));
        if (typeof mounted === 'function') mounted(parent);
      },
      fragment,
      destroy,
    }) satisfies ComponentInstance;
  };
}

export function isComponentInstance(c: any): c is ComponentInstance {
  return c?.[$component] === true;
}

function wrap(contents: string) {
  const template = document.createElement('template');
  template.innerHTML = contents;
  return template;
}
