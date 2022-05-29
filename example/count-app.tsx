import * as React from 'react';
import { create } from '../dist'

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
  return <span>{count}</span>
}

const CountPub = () => {
  return <button onClick={() => countSlice.increment(1)}>count + 1</button>
}

const CountSub5 = () => {
  const count5 = countSlice.useCount5()
  return <span>{count5}</span>
}

export const CountApp = () => {
  return <>
    <CountSub />
    <CountPub />
    <CountSub5 />
  </>
}
