import { $computed, $textContent, component } from '../..';

export default component(
  `
    <span class="counter"></span>
    <br>
    <span class="doubled"></span>
  `,
  ({ counter }) => {
    const counterText = $computed(
      () => `Current value: ${counter.get()}`
    );
    const doubledText = $computed(
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
