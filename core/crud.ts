import fs from "fs";
import { v4 as uuid } from "uuid";
const DB_FILE_PATH = "./core/db";

type UUID = string;

interface Todo {
  id: UUID;
  date: string;
  content: string;
  done: boolean;
}

console.log("[CRUD]");

function create(content: string): Todo {
  const todo: Todo = {
    id: uuid(),
    date: new Date().toISOString(),
    content: content,
    done: false,
  };

  const todos: Array<Todo> = [...read(), todo]; //Spread operator + new todo

  fs.writeFileSync(
    DB_FILE_PATH,
    JSON.stringify(
      {
        todos,
      },
      null,
      2
    )
  );

  return todo;
}

function read(): Array<Todo> {
  const dbString = fs.readFileSync(DB_FILE_PATH, "utf-8");
  const db = JSON.parse(dbString || "{}");
  if (!db.todos) {
    //Fail fast validation
    return [];
  }
  return db.todos;
}

function update(id: UUID, partialTodo: Partial<Todo>): Todo {
  let updatedTodo;
  const todos = read();

  todos.forEach((currentTodo) => {
    const isToUpdate = currentTodo.id === id;

    if (isToUpdate) {
      updatedTodo = Object.assign(currentTodo, partialTodo);
    }

    console.log(currentTodo);
  });

  fs.writeFileSync(
    DB_FILE_PATH,
    JSON.stringify(
      {
        todos,
      },
      null,
      2
    )
  );

  if (!updatedTodo) {
    throw new Error("Please, provide another ID.");
  }
  return updatedTodo;
}

function clearDatabase() {
  fs.writeFileSync(DB_FILE_PATH, "");
}

function updateContentById(id: UUID, content: string): Todo {
  return update(id, {
    content,
  });
}

function updateStatusById(id: UUID): Todo {
  const todos = read();
  let updatedTodo: Todo | undefined;

  todos.forEach((currentTodo) => {
    if (currentTodo.id === id) {
      updatedTodo = 
      {
        ...currentTodo,
        done: !currentTodo.done
      };
    }
  });

  if (updatedTodo) {
    const updatedTodos = todos.map((todo) =>
      todo.id === id ? 
      {
        ...todo,
        done: !todo.done
      } : todo
    );

    fs.writeFileSync(
      DB_FILE_PATH,
      JSON.stringify(
        {
        todos: updatedTodos
        }, null, 2)
    );

    return updatedTodo;    
  } else {
    throw new Error("Please provide a valid ID.");
  }
}

function deleteById(id: UUID) {
  const todos = read();

  const todosWithoutOne = todos.filter((todo) => {
    if (id === todo.id) {
      return false;
    }
    return true;
  });

  fs.writeFileSync(
    DB_FILE_PATH,
    JSON.stringify(
      {
        todos: todosWithoutOne,
      },
      null,
      2
    )
  );
}

// [SIMULATION]
clearDatabase();

const firstTodo = create("Primeira TODO");
const secondTodo = create("Segunda TODO");

updateContentById(secondTodo.id, "Atualizada");
updateStatusById(secondTodo.id);
deleteById(firstTodo.id);

console.log(read());
