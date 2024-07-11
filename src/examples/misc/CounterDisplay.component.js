import { Signal } from 'signal-polyfill';
import { $textContent, component } from '../..';

export default component(
  `
    <span class="counter"></span>
    <br>
    <span class="doubled"></span>
  `,
  ({ counter }) => {
    const counterText = new Signal.Computed(
      () => `Current value: ${counter.get()}`
    );
    const doubledText = new Signal.Computed(
      () => `Doubled value: ${counter.get() * 2}`
    );

    return {
      bindings: {
        '.counter': {
          [$textContent]: counterText,
        },
        '.doubled': {
          [$textContent]: doubledText,
        },
      },
    };
  }
);
