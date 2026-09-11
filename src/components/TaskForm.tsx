import React, { useState } from "react";
import Button from "./Button";
import type { Task } from "../App";

type AddTaskProps = {
  onAddTask: (
    title: string,
    description: string,
    completed: boolean,
    image: string,
  ) => void;
  onUpdateTask: (
    id: number,
    title: string,
    description: string,
    completed: boolean,
    image: string,
  ) => void;

  visibility: () => void;

  taskToEdit: Task | null;
};

const TaskForm = ({
  onAddTask,
  onUpdateTask,
  taskToEdit,
  visibility,
}: AddTaskProps) => {
  const [tasks, setTasks] = useState({
    title: taskToEdit?.title ?? "",
    description: taskToEdit?.description ?? "",
    completed: taskToEdit?.completed ?? false,
    image: taskToEdit?.image ?? "",
  });

  const onHandleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (taskToEdit) {
      onUpdateTask(
        taskToEdit.id,
        tasks.title,
        tasks.description,
        tasks.completed,
        tasks.image,
      );
    } else {
      onAddTask(tasks.title, tasks.description, tasks.completed, tasks.image);
    }

    setTasks({
      ...tasks,
      title: "",
      description: "",
      completed: false,
      image: "",
    });

    visibility();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const imageUrl = URL.createObjectURL(file);

      setTasks({
        ...tasks,
        image: imageUrl,
      });
    }
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
      <label className="block text-sm font-semibold text-slate-300">
        <input type="file" accept="image/*" onChange={handleImageChange} />
      </label>
      {taskToEdit ? (
        <Button
          className="w-full bg-amber-500 text-slate-950 hover:bg-amber-400"
          type="submit"
        >
          Update task
        </Button>
      ) : (
        <Button
          className="w-full bg-amber-500 text-slate-950 hover:bg-amber-400"
          type="submit"
        >
          Add task
        </Button>
      )}
    </form>
  );
};

export default TaskForm;
