import { useEffect, useState } from "react";
import { supabase } from "../supabaseAPI";
import uuid from "react-uuid";
import "./Todo.css";

const Todos = () => {
  const [todos, setTodos] = useState([]);

  const selectTodos = async () => {
    let { data } = await supabase
      .from("todosapp")
      .select("*")
      .order("todoid", { ascending: false });
    setTodos(data);
  };

  useEffect(() => {
    selectTodos();
  }, []);

  return (
    <>
      <div className="Todo-card">
        <AddTodo setTodos={selectTodos} />
        <div className="List-view">
          {todos &&
            todos.map((todoItem) => (
              <Todo key={todoItem.id} {...todoItem} setTodos={setTodos} />
            ))}
        </div>
      </div>

      <section>
        <footer>
          <div className="footer_title">
            <h1>This App Developed By Abhimanyu Debata</h1>
          </div>
        </footer>
      </section>
    </>
  );
};

export default Todos;

const AddTodo = ({ setTodos }) => {
  const [task, setTask] = useState("");
  const onSubmit = (event) => {
    event.preventDefault();
    if (task === "") return;
    supabase
      .from("todosapp")
      .insert({ task_name: task, todoid: uuid() })
      .single()
      .then(({ data, error }) => {
        console.log(data, error);
        if (!error) {
          setTodos((prevTodos) => [data, ...prevTodos]);
        }
      });
    setTask(" ");
  };
  return (
    <>
      <div className="todotitle">
        <h1>Todo List</h1>
      </div>
      <form className="add_todo_form">
        <input
          className="input_form"
          placeholder="Add your Todo Task"
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
        />
        <button type="submit" onClick={onSubmit} className="add_button">
          Add
        </button>
      </form>
    </>
  );
};

const Todo = ({ todoid, is_completed, task_name: task, setTodos }) => {
  const [todo, setTodo] = useState(task);
  const [completed, setCompleted] = useState(is_completed);

  const editTodo = (todoid) => {
    if (todo === "") return;
    supabase
      .from("todosapp")
      .update({ task_name: todo })
      .match({ todoid })
      .then((value, error) => {
        console.log(value, error);
      });
  };

  const completedTodo = (todoid) => {
    supabase
      .from("todosapp")
      .update({ is_completed: !completed })
      .match({ todoid })
      .then(({ data, error }) => {
        console.log(data, error);
        if (!error) {
          setCompleted((prev) => !prev);
        }
      });
  };

  const onDeleteTodo = async () => {
    const { error } = await supabase
      .from("todosapp")
      .delete()
      .match({ todoid });
    if (!error) {
      setTodos((prev) => {
        return prev.filter((todoItem) => {
          return todoItem.todoid !== todoid;
        });
      });
    }
  };

  return (
    <>
      <div className="todo-container">
        <div key={todoid} className="Todo_list_item">
          <input
            checked={completed}
            className="completeCheckBox"
            type="checkbox"
            onChange={(e) => {
              e.preventDefault();
              completedTodo(todoid);
            }}
          />
          <input
            className="updateinputbox"
            value={todo}
            onChange={(e) => {
              const { value } = e.target;
              setTodo(value);
            }}
          />
          {task !== todo && (
            <button
              onClick={() => editTodo(todoid, todo)}
              className="todo-update"
            >
              Edit
            </button>
          )}
          <button className="todoDelete" onClick={onDeleteTodo}>
            Delete
          </button>
        </div>
      </div>
    </>
  );
};
