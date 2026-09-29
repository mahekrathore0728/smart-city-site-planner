declare module 'zustand' {
  export function create<T>(
    fn: (
      set: (fn: Partial<T> | ((state: T) => Partial<T>)) => void,
      get: () => T
    ) => T
  ): {
    (): T;
    <U>(selector: (state: T) => U): U;
    getState: () => T;
    setState: (fn: Partial<T> | ((state: T) => Partial<T>)) => void;
    subscribe: (fn: (state: T) => void) => () => void;
  };
}
