import { Signal } from 'signal-polyfill';
import { $textContent, component } from '../..';
import { timeFormat } from './time-format';

export const RunningTime = component(
  'Time: <span></span>',
  ({ runningSince }) => {
    const formattedTime = new Signal.State('');

    let nextFrame;
    const loop = () => {
      const time = Date.now() - runningSince.get().getTime();
      formattedTime.set(timeFormat.format(time));
      nextFrame = requestAnimationFrame(loop);
    };
    loop();

    return {
      bindings: {
        span: {
          [$textContent]: formattedTime,
        },
      },
      cleanup() {
        cancelAnimationFrame(nextFrame);
      },
    };
  }
);
