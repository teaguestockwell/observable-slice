import * as React from 'react';
import { create } from '../.'

const countSlice = create({
  initState: {
    count: 0,
  },
  pubs: {
    increment: (draft, by: number) => {
      draft.count += by
    },
  },
  subs: {
    useCount: () => ({
      select: s => s.count
    }),
    useCount5: () => ({
      select: s => s.count,
      willUpdate: (prev, next) => next % 5 !== 0
    })
  }
})

const CountSub = () => {
  const count = countSlice.useCount()
  return <span>static sub {count}</span>
}

const CountSub2 = () => {
  const count = countSlice.useSub(s => s.count)
  return <span>dynamic sub {count}</span>
}

const CountPub = () => {
  return <button onClick={() => countSlice.increment(1)}>count + 1</button>
}

const CountSub5 = () => {
  const count5 = countSlice.useCount5()
  return <span>static sub by 5 {count5}</span>
}

export const CountApp = () => {
  return <div style={{display: 'flex', gap: 10}}>
    <CountSub />
    <CountSub2 />
    <CountSub5 />
    <CountPub />
  </div>
}
