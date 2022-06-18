[![license-shield]][license-url] [![linkedin-shield]][linkedin-url] ![size-url] ![size-url2] [![npm-v]][npm-url] [![gh-shield]][gh-url]

[license-shield]: https://img.shields.io/github/license/teaguestockwell/observable-slice.svg
[license-url]: https://github.com/teaguestockwell/observable-slice/blob/master/LICENSE
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/teague-stockwell/
[size-url]: https://img.shields.io/bundlephobia/minzip/observable-slice
[size-url2]: https://img.shields.io/bundlephobia/min/observable-slice
[npm-v]: https://img.shields.io/npm/v/observable-slice
[npm-url]: https://www.npmjs.com/package/observable-slice
[gh-shield]: https://img.shields.io/badge/-GitHub-black.svg?logo=github&colorB=555
[gh-url]: https://github.com/teaguestockwell/observable-slice

<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/teaguestockwell/observable-slice">
  </a>

  <h3 align="center">observable-slice</h3>

  <p align="center">
    A slice of state that can be observed with react hooks, or callbacks.
    <br />
    <a href="https://codesandbox.io/s/observable-slice-sh6e33">Code Sandbox</a>
    <a href="https://github.com/teaguestockwell/observable-slice/issues">Report Bug</a>
  </p>
</p>

## About

Create an observable for global state that can be subscribed to with react hooks, or callbacks.

## Getting Started

To get a local copy up and running follow these simple steps, or see the [Code Sandbox](https://codesandbox.io/s/observable-slice-sh6e33)

```sh
npm i observable-slice
```

## Create a slice of state

```tsx
import { create } from 'observable-slice';

const countSlice = create({
  initState: {
    count: 0,
  },
  pubs: {
    increment: (draft, by: number) => {
      draft.count += by;
    },
  },
  useSubs: {
    useCount: () => ({
      select: s => s.count,
    }),
    useCount5: () => ({
      select: s => s.count,
      willUpdate: (prev, next) => next % 5 !== 0,
    }),
  },
});

const CountSub = () => {
  const count = countSlice.useCount();
  return <span>{count}</span>;
};

const CountPub = () => {
  return <button onClick={() => countSlice.increment(1)}>count + 1</button>;
};

const CountSub5 = () => {
  const count5 = countSlice.useCount5();
  return <span>{count5}</span>;
};

export const CountApp = () => {
  return (
    <>
      <CountSub />
      <CountPub />
      <CountSub5 />
    </>
  );
};
```

# Props

## create
A function that creates a slice of state with the following props:

|     name     |        type         | default |                                                                                                                  description                                                                                                                   |
| :----------: | :-----------------: | :-----: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|  initState   |        JSON         |         |                                                                                                  The uncontrolled initial state of the slice.                                                                                                  |
|     pubs     |   {} \| undefined   |         | The publishers will mutate the slice then notify the subscribers. These reducers are wrapped in immer's produce: https://immerjs.github.io/immer/update-patterns. If a publisher needs more than one parameter, it may be passed as an object. |
|     useSubs  |   {} \| undefined   |         |                                                                   The subscribers will be available as react hooks and must be used inside of a react functional component.                                                                    |
| debounceWait | number \| undefined |   100   |                                                                                   The amount of milliseconds to wait before notifying the subscribers again.                                                                                   |

## slice
The observable returned from a create function
|     name     |        type         | default |                                                                                                                  description                                                                                                                   |
| :----------: | :-----------------: | :-----: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| pub          |        fn           |         | Used to publish updates to subscribers by mutating the slice. This is an alternative way to mutate state. You may use slice.pub instead defining reducers inside of create.pubs. pub is also wrapped in immer's produce. All publishers may be used outside of the react.                       |
| sub          |        fn           |         | Used to subscribe to updates from publishers. This is an alternative way to subscribe to state that can be used outside of a react.                                                                                                            |
| useSub       |        fn           |         | A react hook that will cause re renders to its component when the selected portion of the slice (param0) changes based on the willUpdate fn (param1)                                                                                           |
| $pub         |        fn           |         | Each entry defined in create.pubs will be available on the returned slice. If you would like to pass more than one arg to the reducer, you may put them into an object                                                                         |
| $useSub      |        fn           |         | Each entry defined in create.subs will create a react hook that may be consumed to subscribe to the slice. These hooks may also accept one parameter. For example, the useTodo subscription may accept the id of the todo to subscribe to.     |
## Roadmap

See the [open issues](https://github.com/tsappdevelopment/observable-slice/issues) for a list of proposed features (and known issues).

## License

See `LICENSE` for more information.

## Contact

Teague Stockwell - [LinkedIn](https://www.linkedin.com/in/teague-stockwell)
