import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { CountApp } from './count-app'
import { TodoApp } from './todo-app'

const App = () => {
  return <>
    <CountApp />
    <TodoApp />
  </>
}


ReactDOM.render(<App />, document.getElementById('root'));
