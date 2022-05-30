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

## Built With

- [TSdx](https://github.com/formium/tsdx)
- [TypeScript](https://www.typescriptlang.org)

## Getting Started

To get a local copy up and running follow these simple steps, or see the [Code Sandbox]([Code Sandbox](https://codesandbox.io/s/observable-slice-sh6e33)

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
  subs: {
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

|     name     |        type         | default |                                                                                                                  description                                                                                                                   |
| :----------: | :-----------------: | :-----: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|  initState   |        JSON         |         |                                                                                                  The uncontrolled initial state of the slice.                                                                                                  |
|     pubs     |   {} \| undefined   |         | The publishers will mutate the slice then notify the subscribers. These reducers are wrapped in immer's produce: https://immerjs.github.io/immer/update-patterns. If a publisher needs more than one parameter, it may be passed as an object. |
|     subs     |   {} \| undefined   |         |                                                                   The subscribers will be available as react hooks and must be used inside of a react functional component.                                                                    |
| debounceWait | number \| undefined |   100   |                                                                                   The amount of milliseconds to wait before notifying the subscribers again.                                                                                   |

## Roadmap

See the [open issues](https://github.com/tsappdevelopment/observable-slice/issues) for a list of proposed features (and known issues).

## License

See `LICENSE` for more information.

## Contact

Teague Stockwell - [LinkedIn](https://www.linkedin.com/in/teague-stockwell)
