# Klaarover

Signal-based reactive JavaScript UI framework that should not be used.

## Playground

Try it out on [StackBlitz](https://stackblitz.com/edit/klaarover).

## What is this?

This framework was built in a few days as a mental exercise and an in-depth study of the Signal concept. It should be noted that this occurred during sleepless days and nights caused by a newborn baby. Besides that, this project is based on the [TC39 proposal polyfill](https://github.com/proposal-signals/signal-polyfill) version 0.1.1, so this will likely be incompatible in the future. Oh yeah, this framework probably contains bugs and lacks many features. Did I mention I have not written any tests?

I would therefore discourage anyone to use this framework for purposes other than those for which it was created. I look back very positively on creating this small framework, and would encourage any frontend developer to also build their own experimental framework based on Signals (and then not use it). This repository and package perhaps could be a good inspiration of how (not) to do it.

## Motivation

With modern JavaScript frameworks moving towards Signal-based reactivity (Angular, Svelte, Vue †), and with Signals being seriously proposed as an addition to the language, I felt the need to thoroughly understand what Signals are and how they work. Besides that, I thought it would be interesting to have my own minimal JavaScript component-based framework to use on small side projects or in prototypes. A framework that requires no build step and allows for quick development ††.

_† in alphabetical order and definitely not exhaustive_

_†† I have since remembered that Vue meets these requirements_

## Installation

### Using a bundler

`npm i klaarover`

### Using a local copy

Place the following script in your HTML `head` before any other script tags.

```HTML
<script type="importmap">
  {
    "imports": {
      "klaarover": "./find/the/path/to/klaarover/index.js"
    }
  }
</script>
```

## Usage

### Hello world

```HTML
<div id="app"></div>

<script type="module">
  import { component, render } from 'klaarover';

  const helloWorld = component('Hello world!');
  render(app, helloWorld());
</script>
```

### Boring counter

Everybody is doing boring counter examples for signals, so here goes.

Setup the `index.html` to import and render the `App` component.

```HTML
<!-- index.html -->
<html>
  <head>
    <!-- … -->
  </head>
  <body>
    <div id="app"></div>

    <script type="module">
      import { render } from 'klaarover';
      import App from './App.component';

      render(app, App());
    </script>
  </body>
</html>
```

`App.component.js` contains the component template and logic.

```JavaScript
/* App.component.js */
import { component, $computed, $state, $textContent } from 'klaarover';

export default component(`
  <main>
    <h1>Boring counter</h1>
    <p></p>
    <button>Add 1</button>
  </main>
`, (props) => {
  // This runs when the component is initialized
  const counter = $state(0);
  const counterText = $computed(() => `Count: ${counter.get()}`);

  // Fill in the content of the template using bindings.
  return {
    bindings: {
      // Key is a query selector
      p: {
        // Binding to element attributes:
        class: 'string or Signal',
        style: `color: ${props.color ?? 'red'};`,
        'aria-description': 'Bind to any attribute',

        // Special binding for textContent:
        [$textContent]: counterText
      },
      button: {
        // Binding to events:
        onclick: () => counter.set(counter.get() + 1)
      }
    }
  }
});
```

### Nesting components

Use the `$child` binding key to render child components within template elements.

```JavaScript
/* Parent.component.js */
import { component, $child } from 'klaarover';
import Navigation from './Navigation.component';

export default component(`
  <nav></nav>
  <main>
    <h1>Parent</h1>
    <article></article>
  </main>
`, () => {
  return {
    bindings: {
      nav: {
        // static import:
        [$child]: Navigation()
      },
      article: {
        // dynamic import:
        [$child]: import('./Article.component').then(m => m.default());
      }
    }
  }
})
```

### Props

Props can be passed to components when initializing them. Props are an object, and their type can be specified when using TypeScript (or JSDoc).

```TypeScript
// UserList.component.ts

import { component, $children } from 'klaarover';
import User from './User.component';

export default UserList = component(`
  <table>
    <thead>
      <tr>
        <th>First name</th>
        <th>Email</th>
      </tr>
    </thead>
    <tbody></tbody>
  </table>
`, () => ({
  bindings: {
    'tbody': {
      [$children]: [
        User({ firstName: 'John', email: 'John@example.com' }),
        User({ firstName: 'Jane', email: 'Jane@example.com' }),
      ]
    }
  }
}));
```

```TypeScript
// User.component.ts

import { component, $textContent } from 'klaarover';

export default component<{ firstName: string, email: string }>(`
  <tr>
    <td class="name"></td>
    <td class="email"></td>
  </tr>
`, ({ firstName, email }) => ({
  bindings: {
    '.name': {
      [$textContent]: firstName
    },
    '.email': {
      [$textContent]: email
    }
  }
}))
```

### Conditional rendering

Use Signals, in combination with the `$child` binding key to render children conditionally.

```JavaScript
// Conditionals.component.js

import { component, $child, $computed, $state } from 'klaarover';
import Secrets from './Secrets.component';

export default component(`
  <h3>All my secrets</h3>
  <p></p>
  <button id="reveal">Reveal secrets</button>
  <button id="hide">Hide secrets</button>
`, () => {
  const revealed = $state(false);

  const toggledSecrets = $computed(() => {
    if (releaved.get()) {
      return Secrets();
    }
    return null;
  });

  return {
    bindings: {
      p: {
        [$child]: toggledSecrets
      },
      "button#reveal": {
        onclick: () => revealed.set(true)
      },
      "button#hide": {
        onclick: () => revealed.set(false)
      }
    }
  }
})
```

### Component lifecycle

```JavaScript
// Lifecycle.component.js

import { component, $textContent } from 'klaarover';

export default component(`
  <h1>Lifecycle</h1>
  <p>Initialized: <time class="init"></time></p>
  <p>Mounted: <time class="mounted"></time></p>
`, (props, { lifecycle }) => {
  console.log('Component instance initialization.');

  const initDate = $state(new Date());
  const mountedDate = $state(null);

  document.addEventListener('keydown', (event) => {
    // Act upon 'global' event
  }, {
    // Cleanup event listener when component is destroyed:
    signal: lifecycle
  });

  return {
    bindings: {
      "time.init": {
        datetime: toIsoString(initDate),
        [$textContent]: toLocaleString(initDate)
      },
      "time.mounted": {
        datetime: toIsoString(mountedDate),
        [$textContent]: toLocaleString(mountedDate)
      }
    },
    mounted() {
      console.log('This component instance is added to the DOM.');
      mountedDate.set(new Date());
    },
    cleanup() {
      console.log('This component instance is now removed from the DOM and will never be used again.');
    }
  }
});

function toIsoString(date) {
  return $computed(() => date.get().toISOString());
}

function toLocaleString(date) {
  return $computed(() => date.get().toLocaleString());
}
```

### Effects

Many side effects can be handled using `mounted`, `cleanup`, and the `lifecycle` AbortSignal. But sometimes you may want to react to Signal changes. Within a component’s initialisation function, the `$effect` function is available for this. Effects callbacks are run by the component’s scheduler, until the component is destroyed.

```JavaScript
// Effects.component.js

import { component, $state, $computed, $textContent } from 'klaarover';

export default component(`
  <h1>Effects</h1>
  <p></p>
  <button>Increment</button>
`, (_, { $effect }) => {
  const counter = $state(0);

  $effect(() => {
    console.log('Counter has changed to:', counter.get());
  });

  $effect(() => {
    let time = 0;
    let interval = setInterval(() => {
      console.log(`The value of Counter has remained the same for ${++time} seconds.`);
    }, 1000);   
    return () => clearInterval(interval);
  });

  return {
    bindings: {
      p: {
        [$textContent]: $computed(() => `Counter value: ${counter.get()}`)
      },
      button: {
        onclick: () => counter.set(counter.get() + 1)
      }
    }
  }
});
```

### Schedulers

Components are initialized synchronously. After that, schedulers can be used to defer DOM updates caused by Signal updates. Available schedulers are:
- `microtask` (default)
- `animationFrame` – limits updates to the display's frame rate
- `idleCallback` – limits updates to when the browser is idle
- `throttleScheduler` – limits updates to a specified interval

The following example shows a component that increments a counter every 2 milliseconds. The component is instantiated using the `animationFrame` scheduler, so that the DOM is updated at the display's frame rate. The number will still increment ~500 per second, regardless of frame rate.

```JavaScript
import { component, $child, $textContent, $state } from 'klaarover';
import { animationFrame } from 'klaarover/lib/schedulers';

export default component(`
  <h1>Schedulers</h1>
  <p></p>
`, () => {
  return {
    bindings: {
      p: {
        [$child]: FastUpdates({}, { scheduler: animationFrame() })
      }
    }
  }
});

const FastUpdates = component(`
  Fast counter: <span></span>
`, () => {
  const counter = $state(0);

  function updateCounter() {
    counter.set(counter.get() + 1);
  }

  let interval;
  return {
    bindings: {
      p: {
        [$textContent]: counter,
      }
    },
    mounted() {
      // Update the counter very frequently
      setInterval(updateCounter, 2);
    },
    cleanup() {
      clearInterval(interval);
    }
  }
});
```

### Lazy utility component

Component logic can be eagerly imported either statically or dynamically, as shown in _Nesting components_ above. The utility component `Lazy` can be used for lazy loading.

```JavaScript
import { component } from 'klaarover';
import { Lazy, delay, trigger, idleTime } from 'klaarover/lib/components';

export default component(`
  <div class="delayed"></div>
  <div class="triggered"></div>
  <button>Trigger</button>
  <div class="idle"></div>
`, () => {
  const manualTrigger = Promise.withResolvers();

  return {
    bindings: {
      '.delayed': Lazy({
        loader: import('./Child.component.js').then(m => m.default()),
        strategy: delay(5000),
        placeholder: component('Wait for it…')(),
      }),
      '.triggered': Lazy({
        loader: import('./Child.component.js').then(m => m.default()),
        strategy: trigger(manualTrigger.promise),
        placeholder: component('Press the button to show my contents.')(),
      }),
      button: {
        onclick: () => manualTrigger.resolve(),
      },
      '.idle': Lazy({
        loader: import('./Child.component.js').then(m => m.default()),
        strategy: idleTime({ timeout: 3000 }),
      })
    }
  }
});
```
