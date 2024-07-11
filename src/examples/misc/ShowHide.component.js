import { Signal } from 'signal-polyfill';
import { $child, $textContent, ComponentInstance, component } from '../..';

export default component(
  `
    <article>
      <button></button>
      <figure></figure>
    </article>
  `,
  (props) => {
    const child = new Signal.State(null);

    const buttonText = new Signal.Computed(() => {
      return child.get() ? 'Hide' : 'Show';
    });

    function toggle() {
      if (child.get()) {
        return child.set(null);
      }
      child.set(props.component());
    }

    return {
      bindings: {
        figure: {
          [$child]: child,
        },
        button: {
          [$textContent]: buttonText,
          onclick: toggle,
        },
      },
    };
  }
);
