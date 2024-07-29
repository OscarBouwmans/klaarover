import { Signal } from 'signal-polyfill';

export type AnySignal<T> = Signal.State<T> | Signal.Computed<T>;

export function $state<T>(initialValue: T): Signal.State<T> {
    return new Signal.State(initialValue);
}

export function $computed<T>(computation: () => T): Signal.Computed<T> {
    return new Signal.Computed(computation);
}
