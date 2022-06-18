import * as React from 'react';
import produce, { Draft, freeze } from 'immer';
import { JsonObject } from 'type-fest';
import debounce from 'lodash.debounce';

/**
 * https://github.com/teaguestockwell/observable-slice
 * @returns A slice of state that can be observed with react hooks, or callbacks.
 */
export const create = <
  State extends JsonObject,
  Pubs extends Record<string, (state: Draft<State>, payload: any) => void>,
  UseSubs extends Record<
    string,
    (
      arg?: any
    ) => {
      select: (state: State) => unknown;
      willUpdate?: (prev: any, next: any) => boolean;
    }
  >
>({
  initState,
  pubs,
  useSubs,
  debounceWait = 100,
}: {
  /**
   * The uncontrolled initial state of the slice.
   * This must be json serializable.
   */
  initState: State;
  /**
   * The publishers will mutate the slice then notify the subscribers.
   * These reducers are wrapped in immer's produce: https://immerjs.github.io/immer/update-patterns
   * If a publisher needs more than one parameter, it may be passed as an object.
   */
  pubs?: Pubs;
  /**
   * The subscribers will be available as react hooks and must be used inside of a react functional component:
   * @example subs: { useTodo: (id: string) => ({ select: s => s.todos[id] }) }
   * slice.useTodo('1')
   *
   */
  useSubs?: UseSubs;
  /**
   * The amount of milliseconds to wait before notifying the subscribers again.
   */
  debounceWait?: number;
}) => {
  let state = freeze(initState, true);
  const subscribers = new Set<() => void>();
  const _notify = () => subscribers.forEach(s => s());
  const notify = debounceWait && debounceWait > 0 ? debounce(_notify, debounceWait) : _notify;

  const res: any = {
    get: () => state,
    pub: (update: (state: Draft<State>) => void) => {
      state = produce(state as any, update) as any;
      notify();
    },
    sub: <T>(
      select: (state: State) => T,
      cb: (arg: T) => void,
      willUpdate?: (prev: T, next: T) => boolean
    ) => {
      let prev = select(state);
      const sub = () => {
        const next = select(state);
        const update = willUpdate ? willUpdate(prev, next) : prev !== next;
        if (update) {
          cb(next);
          prev = next;
        }
      };

      subscribers.add(sub);

      return () => {
        subscribers.delete(sub);
      };
    },
    useSub: <T>(
      select: (state: State) => T,
      willUpdate?: (prev: T, next: T) => boolean
    ) => {
      const [selected, setSelected] = React.useState(() => select(state));
      React.useEffect(() => {
        const sub = () =>
          setSelected((prev: any) => {
            const next = select(state);
            const update = willUpdate ? willUpdate(prev, next) : prev !== next;
            return update ? next : prev;
          });

        subscribers.add(sub);

        return () => {
          subscribers.delete(sub);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

      return selected;
    },
  };

  if (pubs) {
    Object.keys(pubs).forEach(k => {
      res[k] = (payload: any) =>
        res.pub((draft: any) => pubs[k](draft, payload));
    });
  }

  if (useSubs) {
    Object.keys(useSubs).forEach(k => {
      res[k] = (arg: any) => {
        const { select, willUpdate } = useSubs[k](arg);
        return res.useSub(select, willUpdate);
      };
    });
  }

  return res as {
    /**
     * Get the current state of the slice. This is immutable.
     */
    get: () => State;
    /**
     * This will mutate the slice then notify the subscribers.
     * The update function is wrapped in immer's produce: https://immerjs.github.io/immer/update-patterns
     */
    pub: (update: (state: Draft<State>) => State | void) => void;
    /**
     * Subscribe to the selected state of the slice.
     */
    sub: <T>(
      /**
       * The function that will select the state to subscribe to.
       */
      select: (state: State) => T,
      /**
       * Called with the selected arg when willUpdate(previousSelected, nextSelected) is true.
       */
      cb: (arg: T) => unknown,
      /**
       * A function that will be called to determine if this subscriber should be notified. By default this is a strict equality check.
       */
      willUpdate?: (prev: T, next: T) => boolean
    ) => () => void;
    /**
     * Subscribe to the selected state of the slice using a react hook.
     */
    useSub: <T>(
      select: (state: State) => T,
      willUpdate?: (prev: T, next: T) => boolean
    ) => T;
  } & {
    [K in keyof Pubs]: (arg: Parameters<Pubs[K]>[1]) => void;
  } &
    {
      [K in keyof UseSubs]: (
        ...arg: Parameters<UseSubs[K]>
      ) => ReturnType<ReturnType<UseSubs[K]>['select']>;
    };
};
