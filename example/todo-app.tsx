import * as React from 'react'
import { create } from '../dist'

const styles: Record<string, React.CSSProperties> = {
  todoRoot: {
    border: "1px solid black",
    borderRadius: 10,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    padding: 10
  },
  todoRow: {
    display: "flex",
    alignItems: "center",
    gap: 10
  }
};

const todoSlice = create({
  initState: {
    todos: {} as Record<string, { id: string; done: boolean; text: string }>
  },
  pubs: {
    updateTodoText: (draft, payload: { id: string; value: string }) => {
      const todo = draft.todos[payload.id];
      if (todo) {
        todo.text = payload.value;
      }
    },
    toggleTodoDone: (draft, id: string) => {
      const todo = draft.todos[id];
      if (todo) {
        todo.done = !todo.done;
      }
    },
    addTodo: (draft) => {
      const id = performance.now().toString() + Math.random();
      const todo = {
        id,
        text: "",
        done: false
      };
      draft.todos[id] = todo;
    },
    removeTodo: (draft, id: string) => {
      delete draft.todos[id];
    }
  },
  subs: {
    useTodos: () => ({
      select: (s) => s.todos,
      willUpdate: (p, c) => Object.keys(p).length === Object.keys(c).length
    }),
    useTodo: ({ id }: { id: string }) => ({
      select: (s) => s.todos[id]
    })
  }
});

const removeLogger = todoSlice.sub((s) => s, console.log);

const Todo = ({ id }: { id: string }) => {
  const todo = todoSlice.useTodo({ id });

  if (!todo) {
    return null;
  }

  return (
    <div style={styles.todoRoot}>
      <div style={styles.todoRow}>
        <label>id: </label>
        <span>{todo.id}</span>
      </div>
      <div style={styles.todoRow}>
        <label>text: </label>
        <input
          defaultValue={todo.text}
          onChange={(e) => {
            todoSlice.updateTodoText({ id, value: e.target.value });
          }}
        />
      </div>
      <div style={styles.todoRow}>
        <span>done: </span>
        <input
          type="checkbox"
          defaultChecked={todo.done}
          onChange={(e) => {
            todoSlice.toggleTodoDone(id);
          }}
        />
      </div>
      <button onClick={(e) => todoSlice.removeTodo(id)}>delete</button>
    </div>
  );
};

const TodoList = () => {
  const todos = todoSlice.useTodos();
  return (
    <>
      {Object.values(todos).map((t) => (
        <Todo key={t.id} id={t.id} />
      ))}
    </>
  );
};

const AddTodo = () => {
  return (
    <button
      onClick={() => {
        for (let i = 0; i < 1000; i++) {
          todoSlice.addTodo(undefined);
        }
      }}
    >
      new
    </button>
  );
};

export const TodoApp = () => {
  return (
    <>
      <AddTodo />
      <TodoList />
    </>
  );
};