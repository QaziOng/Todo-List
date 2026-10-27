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
    image: string | null,
  ) => void;

  visibility: () => void;

  taskToEdit: Task | null;
};

type TaskFormState = {
  title: string;
  description: string;
  completed: boolean;
  imageUrl: string;
};

const getFormValues = (task: Task | null): TaskFormState => ({
  title: task?.title ?? "",
  description: task?.description ?? "",
  completed: task?.completed ?? false,
  imageUrl: "",
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    setTasks(getFormValues(taskToEdit));
    setSelectedFile(null);
    setError("");
    setMessage("");
  }, [taskToEdit]);

  const onHandleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (selectedFile && tasks.imageUrl.trim()) {
      setError("Choose an image file or enter an image URL, not both.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      title: tasks.title.trim(),
      description: tasks.description.trim(),
      completed: tasks.completed,
    };

    const body = new FormData();
    body.append("title", payload.title);
    body.append("description", payload.description);
    body.append("completed", String(payload.completed));

    if (selectedFile) {
      body.append("image", selectedFile);
    }
    if (tasks.imageUrl.trim()) {
      body.append("imageUrl", tasks.imageUrl.trim());
    }

    const taskEndpoint = taskToEdit
      ? `http://localhost:3000/api/v1/tasks/${taskToEdit.id}`
      : `http://localhost:3000/api/v1/tasks/create`;

    try {
      const response = await fetch(taskEndpoint, {
        method: taskToEdit ? "PUT" : "POST",
        credentials: "include",
        body,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message ?? "Task creation failed!");
      }

      const savedImage = result.task.image_key
        ? `http://localhost:3000/uploads/${encodeURIComponent(result.task.image_key)}`
        : null;

      if (taskToEdit) {
        onUpdateTask(
          taskToEdit.id,
          payload.title,
          payload.description,
          payload.completed,
          savedImage,
        );
        setMessage("Task updated Successfully");
      } else {
        onAddTask(
          result.task.id,
          payload.title,
          payload.description,
          payload.completed,
          savedImage,
        );
        setTasks(getFormValues(null));
        setSelectedFile(null);
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
        Choose image file (optional)
        <br />
        <input
          type="file"
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(event) => {
            setSelectedFile(event.target.files?.[0] ?? null);
          }}
        />
        <span className="mt-1 block text-xs font-normal text-slate-400">
          JPEG, PNG, WebP or GIF; maximum size 8 MB.
        </span>
      </label>
      <label className="block text-sm font-semibold text-slate-300">
        Or import image from URL (optional)
        <input
          type="url"
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
          placeholder="https://example.com/image.jpg"
          value={tasks.imageUrl}
          onChange={(event) =>
            setTasks({ ...tasks, imageUrl: event.target.value })
          }
        />
        <span className="mt-1 block text-xs font-normal text-slate-400">
          Select a file or enter an HTTP(S) URL, not both. Leaving both empty
          keeps the current image when editing.
        </span>
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
