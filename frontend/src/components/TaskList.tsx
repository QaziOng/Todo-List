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
  // return (
  //   <section>
  //     {tasks.length === 0 ? (
  //       <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/70 px-6 text-center">
  //         <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-100 text-3xl text-teal-700">
  //           ✓
  //         </div>
  //         <h2 className="font-serif text-3xl font-semibold text-slate-950">
  //           Your list is clear.
  //         </h2>
  //         <p className="mt-2 max-w-sm leading-7 text-slate-500">
  //           A quiet workspace is a good place to start something meaningful.
  //         </p>
  //       </div>
  //     ) : (
  //       <div className="space-y-4">
  //         <div className="flex items-center justify-between px-1">
  //           <h2 className="font-serif text-3xl font-semibold text-slate-950">
  //             Your tasks
  //           </h2>
  //           <span className="text-sm font-semibold text-slate-500">
  //             {tasks.length} {tasks.length === 1 ? "item" : "items"}
  //           </span>
  //         </div>
  //         <div className="space-y-3">
  //           {tasks.map((task) => (
  //             <article
  //               className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-200 hover:shadow-md sm:flex-row sm:items-start sm:justify-between"
  //               key={task.id}
  //             >
  //               <div className="flex gap-4">
  //                 <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-amber-400 ring-4 ring-amber-100" />
  //                 <div>
  //                   <h3 className="text-lg font-bold text-slate-950">
  //                     {task.title}
  //                   </h3>
  //                   <p className="mt-1 leading-7 text-slate-600">
  //                     {task.description}
  //                   </p>
  //                   {task.completed ? (
  //                     <p className="mt-1 leading-7 text-green-600">Completed</p>
  //                   ) : (
  //                     <p className="flex space-y-2 mt-1 leading-7 text-yellow-600">
  //                       Pending{" "}
  //                     </p>
  //                   )}
  //                 </div>
  //               </div>
  //               <Button
  //                 className="self-start px-3 py-2 text-xs text-slate-500 hover:bg-red-50 hover:text-red-600"
  //                 aria-label={`Delete ${task.title}`}
  //                 onClick={() => onDelete(task.id)}
  //               >
  //                 Delete
  //               </Button>
  //               <Button
  //                 className="self-start px-3 py-2 text-xs text-slate-500 hover:bg-red-50 hover:text-blue-600"
  //                 aria-label={`Delete ${task.title}`}
  //                 onClick={() => {}}
  //               >
  //                 Update
  //               </Button>
  //             </article>
  //           ))}
  //         </div>
  //       </div>
  //     )}
  //   </section>
  // );

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
            <h2 className="font-serif text-3xl font-semibold text-slate-950">
              Your tasks
            </h2>

            <span className="text-sm font-semibold text-slate-500">
              {tasks.length} {tasks.length === 1 ? "item" : "items"}
            </span>
          </div>

          <div className="space-y-3">
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
