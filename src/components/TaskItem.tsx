import { useState } from "react";
import type { Task } from "../App";
import Button from "./Button";

type TaskItemProps = {
  task: Task;
  onDelete: (id: number) => void;
  onEdit: (task: Task) => void;
  onToggleComplete: (id: number) => void;
};

const TaskItem = ({
  task,
  onDelete,
  onEdit,
  onToggleComplete,
}: TaskItemProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <article
      className={`group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition ${task.completed ? "hover:border-teal-200" : "hover:border-yellow-200"} hover:shadow-md`}
    >
      <div className="flex min-w-0 gap-4">
        <span
          className={`mt-1 h-3 w-3 shrink-0 rounded-full ring-4 ${
            task.completed
              ? "bg-green-400 ring-green-100"
              : "bg-amber-400 ring-amber-100"
          }`}
        />
        <div className="min-w-0 flex-1">
          <h3 className="break-words text-lg font-bold text-slate-950">
            {task.title}
          </h3>

          <p className="mt-1 break-words leading-7 text-slate-600">
            {task.description}
          </p>

          {task.image && (
            <>
              <div className="mt-4 aspect-video w-full max-w-md overflow-hidden rounded-xl bg-slate-100">
                <img
                  src={task.image}
                  alt={task.title}
                  onClick={() => setSelectedImage(task.image)}
                  className="h-full w-full object-cover"
                />
              </div>
              {selectedImage && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
                  onClick={() => setSelectedImage(null)}
                >
                  <img
                    src={selectedImage}
                    alt={task.title}
                    className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain"
                    onClick={(e) => e.stopPropagation()}
                  />

                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="absolute right-6 top-6 text-4xl text-white"
                  >
                    ×
                  </button>
                </div>
              )}
            </>
          )}

          <label
            htmlFor={`taskStatus-${task.id}`}
            className={`mt-4 flex items-center gap-2 leading-7 ${task.completed ? "text-green-600" : "text-yellow-600"}`}
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={(e) => {
                e.stopPropagation();

                onToggleComplete(task.id);
              }}
              id={`taskStatus-${task.id}`}
            />
            <span>{task.completed ? "Completed" : "Pending"}</span>
          </label>
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <Button
          className="px-3 py-2 text-xs text-slate-500 hover:bg-red-50 hover:text-red-600"
          aria-label={`Delete ${task.title}`}
          onClick={() => onDelete(task.id)}
        >
          Delete
        </Button>

        <Button
          className="px-3 py-2 text-xs text-slate-500 hover:bg-blue-50 hover:text-blue-600"
          aria-label={`Update ${task.title}`}
          onClick={() => onEdit(task)}
        >
          Update
        </Button>
      </div>
    </article>
  );
};

export default TaskItem;
