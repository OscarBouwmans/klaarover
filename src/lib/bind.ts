import {
  $child,
  $children,
  $textContent,
  ComponentBindings,
  ComponentInstance,
  isComponentInstance,
} from './component';
import { render } from './render';
import { Scheduler } from './schedulers/scheduler';
import { subscribe } from './subscribe';

export function bind(
  fragment: DocumentFragment,
  bindings: ComponentBindings,
  lifecycle: AbortSignal,
  childComponents: Set<ComponentInstance>,
  scheduler: Scheduler
) {
  const elmnts = new Map<string, Element | null>();
  for (const selector in bindings) {
    // apply the query selector before any potential child nodes are added
    elmnts.set(selector, fragment.querySelector(selector));
  }

  for (const selector in bindings) {
    const elmnt = elmnts.get(selector);
    if (!elmnt) {
      throw new Error(`Unmatched selector '${selector}'.`);
    }

    const rules = bindings[selector];
    const attributes = Reflect.ownKeys(rules);
    for (const attr of attributes) {
      subscribe(
        rules[attr as any],
        (value, previousValue) => {
          if (attr === $textContent) {
            elmnt.textContent = `${value}`;
            return;
          }

          if (attr === $child) {
            if (isComponentInstance(previousValue)) {
              previousValue.destroy();
              childComponents.delete(previousValue);
            }
            if (isComponentInstance(value)) {
              render(elmnt, value);
              childComponents.add(value);
            }
            return;
          }

          if (attr === $children) {
            if (Array.isArray(previousValue)) {
              previousValue.forEach((child) => {
                if (!isComponentInstance(child)) return;
                child.destroy();
                childComponents.delete(child);
              });
            }
            if (Array.isArray(value)) {
              value.forEach((child) => {
                if (!isComponentInstance(child)) return;
                render(elmnt, child);
                childComponents.add(child);
              });
            }
            return;
          }

          if (typeof attr !== 'string') {
            return;
          }

          if (typeof value === 'function') {
            (elmnt as any)[attr] = value;
            return;
          }

          if (typeof value === 'boolean') {
            value
              ? elmnt.setAttribute(attr, attr)
              : elmnt.removeAttribute(attr);
            return;
          }

          elmnt.setAttribute(attr, value);
        },
        lifecycle,
        scheduler
      );
    }
  }
}
