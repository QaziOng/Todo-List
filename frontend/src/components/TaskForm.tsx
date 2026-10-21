import { useEffect, useState, type FormEvent } from "react";
import Button from "./Button";
import type { Task } from "../App";

type AddTaskProps = {
  onAddTask: (
    id: number,
    title: string,
    description: string,
    completed: boolean,
    image: string | null,
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

type TaskFormState = {
  title: string;
  description: string;
  completed: boolean;
  image: string;
};

const getFormValues = (task: Task | null): TaskFormState => ({
  title: task?.title ?? "",
  description: task?.description ?? "",
  completed: task?.completed ?? false,
  image: task?.image ?? "",
});

const TaskForm = ({
  onAddTask,
  onUpdateTask,
  taskToEdit,
  visibility,
}: AddTaskProps) => {
  const [tasks, setTasks] = useState<TaskFormState>(() =>
    getFormValues(taskToEdit),
  );
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTasks(getFormValues(taskToEdit));
    setError("");
    setMessage("");
  }, [taskToEdit]);

  const onHandleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    const payload = {
      title: tasks.title.trim(),
      description: tasks.description.trim(),
      completed: tasks.completed,
      image_url: tasks.image.trim() || null,
    };

    try {
      const response = await fetch(
        taskToEdit
          ? `http://localhost:3000/api/v1/tasks/${taskToEdit.id}`
          : `http://localhost:3000/api/v1/tasks/create`,
        {
          method: taskToEdit ? "PUT" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message ?? "Task creation failed!");
      }

      if (taskToEdit) {
        onUpdateTask(
          taskToEdit.id,
          payload.title,
          payload.description,
          payload.completed,
          payload.image_url ?? "",
        );
        setMessage("Task updated Successfully");
      } else {
        onAddTask(
          result.task.id,
          payload.title,
          payload.description,
          payload.completed,
          payload.image_url ?? "",
        );
        setTasks(getFormValues(null));
        setMessage("Task created successfully");
      }
      visibility();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not connect to server",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={onHandleSubmit}>
      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="text-sm text-green-400">
          {message}
        </p>
      )}
      <label className="block text-sm font-semibold text-slate-300">
        Task title
        <input
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
          placeholder="e.g. Plan the week"
          value={tasks.title}
          required
          maxLength={72}
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
          onChange={(event) =>
            setTasks({
              ...tasks,
              description: event.target.value,
            })
          }
        />
      </label>
      <label className="block text-sm font-semibold text-slate-300">
        Image URL (optional)
        <input
          type="url"
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
          placeholder="https://example.com/image.jpg"
          value={tasks.image}
          onChange={(event) => {
            setTasks({ ...tasks, image: event.target.value });
          }}
        />
      </label>

      <Button
        className="w-full bg-amber-500 text-slate-950 hover:bg-amber-400"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Saving..." : taskToEdit ? "Update Task" : "Add Task"}
      </Button>

      <Button
        className="w-full bg-slate-700 text-white hover:bg-slate-600"
        type="button"
        onClick={visibility}
      >
        Close
      </Button>
    </form>
  );
};

export default TaskForm;
