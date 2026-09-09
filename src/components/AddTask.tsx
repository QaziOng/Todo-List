import React, { useState } from "react";
import Button from "./Button";

type AddTaskProps = {
  onAddTask: (title: string, description: string, completed: boolean) => void;
};

const AddTask = ({ onAddTask }: AddTaskProps) => {
  const [tasks, setTasks] = useState({
    title: "",
    description: "",
    completed: false,
  });

  const onHandleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    onAddTask(tasks.title, tasks.description, tasks.completed);

    setTasks({
      ...tasks,
      title: "",
      description: "",
      completed: false,
    });
  };

  return (
    <form className="space-y-5" onSubmit={onHandleSubmit}>
      <label className="block text-sm font-semibold text-slate-300">
        Task title
        <input
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
          placeholder="e.g. Plan the week"
          value={tasks.title}
          required
          onChange={(event) =>
            setTasks({
              ...tasks,
              title: event.target.value,
            })
          }
        />
      </label>
      <label className="block text-sm font-semibold text-slate-300">
        Description
        <textarea
          className="mt-2 min-h-28 w-full resize-y rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
          placeholder="What does done look like?"
          value={tasks.description}
          required
          onChange={(event) =>
            setTasks({
              ...tasks,
              description: event.target.value,
            })
          }
        />
      </label>
      <Button
        className="w-full bg-amber-500 text-slate-950 hover:bg-amber-400"
        type="submit"
      >
        Add task
      </Button>
    </form>
  );
};

export default AddTask;
