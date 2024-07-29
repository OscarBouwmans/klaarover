import { $children, $textContent, component } from '../..';
import { idleCallback } from '../lib/schedulers/idle-callback.scheduler';

export default component(
  `
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>First name</th>
          <th>Last name</th>
          <th>Favourite Colour</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
    <button>Add person</button>
  `,
  () => {
    const people = $state([]);

    const rows = $computed(() => {
      return people
        .get()
        .map((person, index) =>
          Row({ person, index: index + 1 }, { scheduler: idleCallback() })
        );
    });

    function addPerson() {
      const person = {
        name: { first: 'Peter', last: 'Pan' },
        favouriteColour: 'green',
      };
      people.set([...people.get(), person]);
    }

    return {
      bindings: {
        tbody: {
          [$children]: rows,
        },
        button: {
          onclick: addPerson,
        },
      },
    };
  }
);

const Row = component(
  `
    <tr>
      <th></th>
      <td class="name_first"></td>
      <td class="name_last"></td>
      <td class="favourite_colour"></td>
    </tr>
  `,
  ({ index, person }) => {
    console.log(index, person);
    return {
      bindings: {
        th: {
          [$textContent]: `${index}`,
        },
        '.name_first': {
          [$textContent]: person.name.first,
        },
        '.name_last': {
          [$textContent]: person.name.last,
        },
        '.favourite_colour': {
          [$textContent]: person.favouriteColour,
        },
      },
    };
  }
);
