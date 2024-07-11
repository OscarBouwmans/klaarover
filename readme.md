# Klaarover

## What is this?

This framework was built in a few days as a mental exercise and an in-depth study of the Signal concept. It should be noted that this occurred during the sleepless days caused by a newborn baby. Besides that, this project is based on the TC39 proposal polyfill version 0.1.1, so this will likely be incompatible in the future. Oh yeah, this framework probably contains bugs and lacks many features. Did I mention I have not written any tests?

I would therefore discourage anyone to use this framework for purposes other than those for which it was created. I look back very positively on creating this small framework, and would encourage any frontend developer to also build their own experimental framework based on Signals (and then not use it). This repository and package perhaps could be a good inspiration of how (not) to do it.

## Motivation

With modern JavaScript frameworks moving towards Signal-based reactivity (Angular, Svelte, Vue †), and with Signals being seriously proposed as an addition to the language, I felt the need to thoroughly understand what Signals are and how they work. Besides that, I thought it would be interesting to have my own minimal JavaScript component-based framework to use on small side projects or in prototypes. A framework that requires no build step and allows for quick development ††.

_† in alphabetical order and definitely not exhaustive_
_†† I have since realised that Vue is probably already a great fit for this_

## Installation

### Using a bundler

`npm i klaarover`

### Using a local copy

Place the following script in your HTML `head` before any other script tags.

```
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

```
<div id="app"></div>

<script type="module">
  import { component, render } from 'klaarover';

  const helloWorld = component('Hello world!');
  render(app, helloWorld());
</script>
```

### Boring counter

Everybody is doing boring counter examples for signals, so here goes.

Use the `$textContent` binding key to render static or dynamic text content within an element.

```
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

```
/* App.component.js */
import { component, $textContent } from 'klaarover';
import { Signal } from 'signal-polyfill';

export default component(`
  <main>
    <h1>Boring counter</h1>
    <p></p>
    <button>Add 1</button>
  </main>
`, (props) => {
  // This runs when the component is initialized
  const counter = new Signal.state(0);
  const counterText = new Signal.computed(() => {
    return `Count: ${counter.get()}`;
  });

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
    },
    cleanup() {
      // Optional function to clear timeouts etc.
      // This runs when the component is destroyed.
    }
  }
});
```

### Nesting components

Use the `$child` binding key to render child components within template elements.

```
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

```
/* UserList.component.ts */
import User from './User.component';

/* User.component.ts */
export default component<{ firstName: string, email: string }>(`
  Hello <span class="name"></span>, I will send an email to <span class="email"></span>.
`, ({ firstName, email }) => {

})
```

### Conditional rendering

Use Signals, in combination with the `$child` binding key to render children conditionally.

```
/* Conditionals.component.js */
import { component, $child } from 'klaarover';
import { Signal } from 'signal-polyfill';
import Secrets from './Secrets.component';

export default component(`
  <h3>All my secrets</h3>
  <p></p>
  <button id="reveal">Reveal secrets</button>
  <button id="hide">Hide secrets</button>
`, () => {
  const revealed = new Signal.State(false);

  const toggledSecrets = new Signal.computed(() => {
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

```
/* Lifecycle.component.js */
import { component, $textContent } from 'klaarover';
import { Signal } from 'signal-polyfill';

export default component(`
  <h1>Lifecycle</h1>
  <p>Initialized: <time class="init"></time></p>
  <p>Mounted: <time class="mounted"></time></p>
`, () => {
  console.log('Component instance initialization.');

  const initDate = new Signal.State(new Date());
  const mountedDate = new Signal.State(null);

  return {
    bindings: {
      "time.init": {
        datetime: new Signal.Computed(() => initDate.get().toISOString())
        [$textContent]: new Signal.Computed(() => initDate.get().toLocaleString())
      },
      "time.mounted": {
        datetime: new Signal.Computed(() => mountedDate.get()?.toISOString())
        [$textContent]: new Signal.Computed(() => mountedDate.get()?.toLocaleString())
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
})
```

### Schedulers

Components are initialized synchronously. After that, schedulers can be used to defer DOM updates caused by Signal updates. For example, the `idleCallback` scheduler defers updates using `requestIdleCallback`, and the `throttleScheduler` acts like a rate limiter by throttling updates per a provided amount of milliseconds.

### Lazy utility component

Component logic can be eagerly imported either statically or dynamically, as shown in _Nesting components_ above. The utility component `Lazy` can be used for lazy loading.

```
/* Container.component.js */
import { Lazy, delay, trigger, idleTime } from 'klaarover/lib/components';

export default component(`
  <div class="delayed"></div>
  <div class="triggered"></div>
  <button>Trigger</button>
  <div class="idle"></div>
`, () => {
  const waitForMe = Promise.withResolvers();

  return {
    bindings: {
      '.delayed': Lazy({
        loader: import('./Child.component.js').then(m => m.default()),
        strategy: delay(5000),
        placeholder: component('Wait for it…')(),
      }),
      '.triggered': Lazy({
        loader: import('./Child.component.js').then(m => m.default()),
        strategy: trigger(waitForMe.promise),
        placeholder: component('Press the button to show my contents.')(),
      }),
      button: {
        onclick: () => waitForMe.resolve(),
      },
      '.idle': Lazy({
        loader: import('./Child.component.js').then(m => m.default()),
        strategy: idleTime({ timeout: 3000 }),
      })
    }
  }
});
```
