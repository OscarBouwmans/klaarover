import { $textContent, component } from '../..';

export default component(
  `<span class="minutes"></span>:<span class="seconds"></span>.<span class="hundreds"></span>`,
  () => {
    const ref = new Date();
    const formatter = new Intl.NumberFormat(undefined, {
      minimumIntegerDigits: 2,
    });

    const timer = $state(0);
    const minutes = $computed(() => {
      const m = Math.floor(timer.get() / 60) % 60;
      return formatter.format(m);
    });
    const seconds = $computed(() => {
      const s = Math.floor(timer.get()) % 60;
      return formatter.format(s);
    });
    const hundreds = $computed(() => {
      const d = Math.floor(timer.get() * 100) % 100;
      return formatter.format(d);
    });

    function loop() {
      const now = new Date();
      timer.set((now.getTime() - ref.getTime()) / 1000);
      nextFrame = requestAnimationFrame(loop);
    }

    let nextFrame = requestAnimationFrame(loop);

    return {
      bindings: {
        '.minutes': {
          [$textContent]: minutes,
        },
        '.seconds': {
          [$textContent]: seconds,
        },
        '.hundreds': {
          [$textContent]: hundreds,
        },
      },
      cleanup() {
        cancelAnimationFrame(nextFrame);
      },
    };
  }
);
