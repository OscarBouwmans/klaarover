import { Signal } from "signal-polyfill";
import { $computed } from "./signals";
import { Scheduler } from "./schedulers";

export type ComponentEffect = (
    setup: () => void | (() => void),
) => void;

export function createEffect(
    lifecycle: AbortSignal,
    scheduler: Scheduler
): ComponentEffect {
    return function $effect(setup: () => void | (() => void)) {
        const reader = $computed(() => setup());

        let cleanup: (() => void) | void;
        let isPending = false;

        const watcher = new Signal.subtle.Watcher(() => {
            if (isPending) {
                return;
            }
            isPending = true;
            scheduler.enqueue(() => {
                if (lifecycle.aborted) return;
                isPending = false;
                if (typeof cleanup === 'function') {
                    cleanup();
                }
                cleanup = reader.get();
                watcher.watch(reader);
            });
        });

        cleanup = reader.get();
        watcher.watch(reader);

        lifecycle.addEventListener(
            'abort',
            () => {
                watcher.unwatch(reader);
                if (typeof cleanup === 'function') {
                    cleanup();
                }
            },
            { once: true }
        );
    }
}
