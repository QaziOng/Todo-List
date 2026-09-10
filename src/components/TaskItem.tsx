import type { Task } from "../App";
import Button from "./Button";

type TaskItemProps = {
  task: Task;
  onDelete: (id: number) => void;
  onEdit: (task: Task) => void;
};

const TaskItem = ({ task, onDelete, onEdit }: TaskItemProps) => {
  return (
    <article className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-200 hover:shadow-md sm:flex-row sm:items-start sm:justify-between">
      <div className="flex gap-4">
        <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-amber-400 ring-4 ring-amber-100" />

        <div>
          <h3 className="text-lg font-bold text-slate-950">{task.title}</h3>

          <p className="mt-1 leading-7 text-slate-600">{task.description}</p>

          {task.completed ? (
            <p className="mt-1 leading-7 text-green-600">Completed</p>
          ) : (
            <p className="mt-1 leading-7 text-yellow-600">Pending</p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          className="self-start px-3 py-2 text-xs text-slate-500 hover:bg-red-50 hover:text-red-600"
          aria-label={`Delete ${task.title}`}
          onClick={() => onDelete(task.id)}
        >
          Delete
        </Button>

        <Button
          className="self-start px-3 py-2 text-xs text-slate-500 hover:bg-blue-50 hover:text-blue-600"
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
