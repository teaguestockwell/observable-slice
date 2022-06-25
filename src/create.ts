import * as React from 'react';

/**
 * https://github.com/teaguestockwell/observable-slice
 * @returns A slice of state that can be observed with react hooks, or callbacks.
 */
export const create = <
  State,
  Pubs extends Record<string, (state: State, payload: any) => State>,
  UseSubs extends Record<
    string,
    (
      arg?: any
    ) => {
      select: (state: State) => unknown;
      willNotify?: (prev: any, next: any) => boolean;
    }
  >
>({
  initState,
  pubs,
  useSubs,
  notifyMiddleware,
  onPub,
}: {
  /**
   * The uncontrolled initial state of the slice.
   * This must be json serializable.
   */
  initState: State;
  /**
   * The publishers will replace the slice then notify the subscribers.
   *  It is recommended to wrap these reducers in immer's produce: https://immerjs.github.io/immer/update-patterns
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
   * You may choose to debounce subscriber notification.
   */
  notifyMiddleware?: (notify: () => void) => () => void;
  /**
   * Will be called with the new state each time an action is dispatched.
   * This is useful for logging or persistance.
   */
  onPub?: (state: State) => void;
}) => {
  let state = initState;
  const subscribers = new Set<() => void>();
  const _notify = () => subscribers.forEach(s => s());
  const notify = notifyMiddleware ? notifyMiddleware(_notify) : _notify;

  const res: any = {
    get: () => state,
    pub: (replace: (state: State) => State) => {
      state = replace(state);
      notify();
      onPub?.(state)
    },
    sub: <T>(
      select: (state: State) => T,
      cb: (arg: T) => void,
      willNotify?: (prev: T, next: T) => boolean
    ) => {
      let prev = select(state);
      const sub = () => {
        const next = select(state);
        const update = willNotify ? willNotify(prev, next) : prev !== next;
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
      willNotify?: (prev: T, next: T) => boolean
    ) => {
      const [selected, setSelected] = React.useState(() => select(state));
      React.useEffect(() => {
        const sub = () =>
          setSelected((prev: any) => {
            const next = select(state);
            const update = willNotify ? willNotify(prev, next) : prev !== next;
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
        const { select, willNotify } = useSubs[k](arg);
        return res.useSub(select, willNotify);
      };
    });
  }

  return res as {
    /**
     * Get the current state of the slice. This is immutable.
     */
    get: () => State;
    /**
     * This will update the slice then notify the subscribers.
     * It is recommended to wrap pubs in immer's produce: https://immerjs.github.io/immer/update-patterns
     */
    pub: (replace: (state: State) => State) => void;
    /**
     * Subscribe to the selected state of the slice.
     */
    sub: <T>(
      /**
       * The function that will select the state to subscribe to.
       */
      select: (state: State) => T,
      /**
       * Called with the selected arg when willNotify(previousSelected, nextSelected) is true.
       */
      cb: (arg: T) => unknown,
      /**
       * A function that will be called to determine if this subscriber should be notified. By default this is a strict equality check.
       */
      willNotify?: (prev: T, next: T) => boolean
    ) => () => void;
    /**
     * Subscribe to the selected state of the slice using a react hook.
     */
    useSub: <T>(
      select: (state: State) => T,
      willNotify?: (prev: T, next: T) => boolean
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
