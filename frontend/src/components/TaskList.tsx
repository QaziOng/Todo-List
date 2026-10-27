import type { Task } from "../App";
import TaskItem from "./TaskItem";

type TaskListProps = {
  tasks: Task[];
  onDelete: (id: number) => void;
  onEdit: (task: Task) => void;
  onToggleComplete: (id: number) => void;
};

const TaskList = ({
  tasks,
  onDelete,
  onEdit,
  onToggleComplete,
}: TaskListProps) => {
  return (
    <section>
      {tasks.length === 0 ? (
        <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/70 px-6 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-100 text-3xl text-teal-700">
            ✓
          </div>

          <h2 className="font-serif text-3xl font-semibold text-slate-950">
            Your list is clear.
          </h2>

          <p className="mt-2 max-w-sm leading-7 text-slate-500">
            A quiet workspace is a good place to start something meaningful.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2
              id="task-list-heading"
              className="font-serif text-3xl font-semibold text-slate-950"
            >
              Your Tasks
            </h2>

            <span className="text-sm font-semibold text-slate-500">
              {tasks.length} {tasks.length === 1 ? "item" : "items"}
            </span>
          </div>

          <div
            aria-labelledby="task-list-heading"
            className="task-scroll-area space-y-3 rounded-3xl border border-transparent bg-[#f5f7f2] p-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 lg:max-h-[calc(100vh-22rem)] lg:overflow-y-auto lg:overscroll-contain lg:p-4 lg:pr-3"
            role="region"
            tabIndex={0}
          >
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onDelete={onDelete}
                onEdit={onEdit}
                onToggleComplete={onToggleComplete}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default TaskList;
