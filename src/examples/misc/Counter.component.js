import { Signal } from 'signal-polyfill';
import { $child, component } from '../..';
import CounterDisplay from './CounterDisplay.component';

export default component(
  `
    <article>
      <h2>Counter</h2>
      <p></p>
      <button class="add-1">Add 1</button>
      <button class="add-5">Add 5</button>
      <button class="sub-2">Subtract 2</button>
    </article>
  `,
  () => {
    const counter = new Signal.State(0);

    return {
      bindings: {
        p: {
          [$child]: CounterDisplay({ counter }),
        },
        'button.add-1': {
          onclick: () => counter.set(counter.get() + 1),
        },
        'button.add-5': {
          onclick: () => counter.set(counter.get() + 5),
        },
        'button.sub-2': {
          onclick: () => counter.set(counter.get() - 2),
        },
      },
    };
  }
);
