import { act, renderHook } from '@testing-library/react';
import { create } from './create';

jest.mock('lodash.debounce', () => ({
  __esModule: true,
  default: (fn: any) => fn,
}));

describe('create', () => {
  it('creates a slice', () => {
    const slice = create({
      initState: {
        counter: 0,
      },
    });
    expect(slice).toBeDefined();
  });
  it('has initial state', () => {
    const slice = create({
      initState: {
        counter: 0,
      },
    });
    expect(slice.get()).toEqual({
      counter: 0,
    });
  });
  it('updates state', () => {
    const slice = create({
      initState: {
        counter: 0,
      },
      pubs: {
        increment: (prev, by: number) => ({
          counter: prev.counter + by,
        }),
      },
    });

    slice.increment(1);

    expect(slice.get()).toEqual({
      counter: 1,
    });
  });
  it('notifies subscribers', () => {
    const slice = create({
      initState: {
        counter: 0,
      },
      pubs: {
        increment: (prev, by: number) => ({
          counter: prev.counter + by,
        }),
      },
    });

    let subbed;
    slice.sub(
      s => s.counter,
      c => (subbed = c)
    );

    expect(subbed).toBe(undefined);
    slice.increment(1);
    expect(subbed).toBe(1);
  });
  it('unsubscribes', () => {
    const slice = create({
      initState: {
        counter: 0,
      },
      pubs: {
        increment: (prev, by: number) => ({
          counter: prev.counter + by,
        }),
      },
    });

    let subbed;
    const unSub = slice.sub(
      s => s.counter,
      c => (subbed = c)
    );
    unSub();
    slice.increment(1);

    expect(subbed).toBe(undefined);
  });
  it('does not notify subscribers that are not selected', () => {
    const slice = create({
      initState: {
        counter: 0,
        counter2: 0,
      },
      pubs: {
        increment: (prev, by: number) => ({
          ...prev,
          counter: prev.counter + by,
        }),
      },
    });

    let subbed;
    slice.sub(
      s => s.counter2,
      c => (subbed = c)
    );

    expect(subbed).toBe(undefined);
    slice.increment(1);
    expect(subbed).toBe(undefined);
  });
  it('does not notify subscribers when will update is false', () => {
    const slice = create({
      initState: {
        counter: 0,
      },
      pubs: {
        increment: (prev, by: number) => ({
          counter: prev.counter + by,
        }),
      },
    });

    let subbed;
    slice.sub(
      s => s.counter,
      c => (subbed = c),
      () => false
    );

    expect(subbed).toBe(undefined);
    slice.increment(1);
    expect(subbed).toBe(undefined);
  });
  it('publishes', () => {
    const slice = create({
      initState: {
        counter: 0,
      },
    });

    slice.pub(p => ({ counter: p.counter + 1 }));

    slice.pub(s => {
      return {
        counter: s.counter + 1,
      };
    });
    expect(slice.get().counter).toBe(2);
  });
  it('has initial state inside of a hook', () => {
    const slice = create({
      initState: {
        counter: 0,
      },
      useSubs: {
        useCounter: () => ({
          select: s => s.counter,
        }),
      },
    });

    const { result } = renderHook(slice.useCounter);

    expect(result.current).toBe(0);
  });
  it('notifies subscribed hooks', () => {
    const slice = create({
      initState: {
        counter: 0,
      },
      pubs: {
        increment: (prev, by: number) => ({
          counter: prev.counter + by,
        }),
      },
      useSubs: {
        useCount: () => ({
          select: s => s.counter,
        }),
      },
    });
    const { result } = renderHook(slice.useCount);

    act(() => {
      slice.increment(1);
    });

    expect(result.current).toBe(1);
  });
  it('does not notify subscribed hooks that are not selected', () => {
    const slice = create({
      initState: {
        counter: 0,
        counter2: 0,
      },
      pubs: {
        increment: (prev, by: number) => ({
          ...prev,
          counter2: prev.counter2 + by,
        }),
      },
      useSubs: {
        useCount: () => ({
          select: s => s.counter,
        }),
      },
    });
    const { result } = renderHook(slice.useCount);

    act(() => {
      slice.increment(1);
    });

    expect(result.current).toBe(0);
  });
  it('does not notify subscribed hooks that have a will update of false', () => {
    const slice = create({
      initState: {
        counter: 0,
      },
      pubs: {
        increment: (prev, by: number) => ({
          counter: prev.counter + by,
        }),
      },
      useSubs: {
        useCount: () => ({
          select: s => s.counter,
          willNotify: () => false,
        }),
      },
    });
    const { result } = renderHook(slice.useCount);

    act(() => {
      slice.increment(1);
    });

    expect(result.current).toBe(0);
  });
  it('useSub has initial state', () => {
    const slice = create({
      initState: {
        counter: 0,
      },
    });

    const { result } = renderHook(() => slice.useSub(s => s.counter));

    expect(result.current).toBe(0);
  });
  it('useSub is notified', () => {
    const slice = create({
      initState: {
        counter: 0,
      },
    });
    const { result } = renderHook(() => slice.useSub(s => s.counter));

    act(() => {
      slice.pub(p => ({ counter: p.counter + 1 }));
    });

    expect(result.current).toBe(1);
  });
  it('useSub is not notified when it is not selected', () => {
    const slice = create({
      initState: {
        counter: 0,
        counter2: 0,
      },
    });
    const { result } = renderHook(() => slice.useSub(s => s.counter2));

    act(() => {
      slice.pub(p => ({ ...p, counter: p.counter + 1 }));
    });

    expect(result.current).toBe(0);
  });
  it('useSub is not notified when will update is false', () => {
    const slice = create({
      initState: {
        counter: 0,
      },
    });
    const { result } = renderHook(() =>
      slice.useSub(
        s => s.counter,
        () => false
      )
    );

    act(() => {
      slice.pub(p => ({ counter: p.counter + 1 }));
    });

    expect(result.current).toBe(0);
  });
  it('can use primitives as state', () => {
    const slice = create({
      initState: 0,
    });

    expect(slice.get()).toBe(0);
    slice.pub(() => 1);
    expect(slice.get()).toBe(1);
  });
  it('runs side effects before internal events are handled', () => {
    const logger = jest.fn();
    const slice = create({
      initState: 0,
      logger,
    });

    slice.get();
    expect(logger).toHaveBeenCalledWith('get', 0);

    const rm = slice.sub(
      s => s,
      () => {}
    );
    expect(logger).toHaveBeenCalledWith('add-sub', 0);

    slice.pub(() => 1);
    expect(logger).toHaveBeenCalledWith('notify-subs', 1);
    expect(logger).toHaveBeenCalledWith('notify-sub', 1);

    rm();
    expect(logger).toHaveBeenCalledWith('rm-sub', 1);
  });
});
