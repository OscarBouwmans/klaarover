import { $child, $state, component } from '../..';
import { timeFormat } from './time-format';
import { RunningTime } from './RunningTime.component';

export const Stopwatch = component(stopwatch, () => {
  const runningSince = $state(null);
  const stoppedTime = $state(0);

  function start() {
    const t = Date.now() - stoppedTime.get() ?? 0;
    runningSince.set(new Date(t));
    stoppedTime.set(null);
  }

  function stop() {
    const time = Date.now() - runningSince.get().getTime();
    runningSince.set(null);
    stoppedTime.set(time);
  }

  function reset() {
    if (runningSince.get()) return start();
    runningSince.set(null);
    stoppedTime.set(0);
  }

  const displayTime = $computed(() => {
    if (runningSince.get()) {
      return RunningTime({ runningSince });
    }
    const formattedTime = timeFormat.format(stoppedTime.get());
    const staticTime = component(`Time: ${formattedTime}`);
    return staticTime();
  });

  const isRunning = $computed(() => {
    return runningSince.get() !== null;
  });

  return {
    bindings: {
      '#time': {
        [$child]: displayTime,
      },
      '#start': {
        onclick: start,
        disabled: isRunning,
      },
      '#stop': {
        onclick: stop,
        disabled: invert(isRunning),
      },
      '#reset': {
        onclick: reset,
      },
    },
  };
});

/**
 * Tiny helper to invert a boolean signal
 */
function invert(source) {
  return $computed(() => !source.get());
}
