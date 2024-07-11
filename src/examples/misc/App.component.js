import { $child, component } from '../..';
import { Lazy, delay } from '../../lib/components';
import ShowHide from './ShowHide.component';
import Table from './Table.component';
import Timer from './Timer.component';

export default component(
  `
    <h1>Klaarover</h1>
    <nav></nav>
    <main></main>
    <br>
    <figure></figure>
    <br>
    <aside></aside>
    <footer></footer>
  `,
  () => {
    return {
      bindings: {
        main: {
          [$child]: import('./Counter.component').then(({ default: Counter }) =>
            Counter()
          ),
        },
        figure: {
          [$child]: Table(),
        },
        aside: {
          [$child]: ShowHide({
            component: () => Timer(),
          }),
        },
        footer: {
          [$child]: Lazy({
            loader: () => Table(),
            strategy: delay(500),
            placeholder: component('Wait for it…')(),
          }),
        },
      },
      cleanup() {},
    };
  }
);
