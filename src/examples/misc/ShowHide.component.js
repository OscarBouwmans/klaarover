import { $child, $computed, $state, $textContent, component } from '../..';

export default component(
  `
    <article>
      <button></button>
      <figure></figure>
    </article>
  `,
  (props) => {
    const child = $state(null);

    const buttonText = $computed(() => {
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
