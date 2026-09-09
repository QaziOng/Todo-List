import { useState } from "react";
import AddTask from "./components/AddTask";
import DisplayTask from "./components/DisplayTask";
import Button from "./components/Button";

export type Task = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
};

const App = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [visibility, setVisibility] = useState(false);

  const addTask = (title: string, description: string, completed: boolean) => {
    const newTask: Task = {
      id: Date.now(),
      title,
      description,
      completed,
    };

    setTasks((previousTask) => [...previousTask, newTask]);
  };

  const deleteTask = (id: number) => {
    setTasks((previousTask) => previousTask.filter((task) => task.id !== id));
  };

  return (
    <main className="min-h-screen bg-[#f5f7f2] px-4 py-8 text-slate-900 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-col gap-6 border-b border-slate-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-teal-700">
              Personal workspace
            </p>
            <h1 className="font-serif text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
              Make room for <span className="text-amber-600">progress.</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">
              Keep the important things visible, manageable, and moving forward.
            </p>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="rounded-2xl bg-white px-4 py-3 text-center shadow-sm ring-1 ring-slate-200">
              <p className="text-2xl font-bold text-slate-950">
                {tasks.length}
              </p>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Tasks
              </p>
            </div>
            <Button
              className="bg-teal-700 text-white shadow-lg shadow-teal-700/20 hover:bg-teal-800"
              onClick={() => setVisibility(true)}
            >
              + New task
            </Button>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <DisplayTask tasks={tasks} onDelete={deleteTask} />

          {visibility ? (
            <aside className="h-fit rounded-3xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-900/10 lg:order-first">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-amber-400">
                    New focus
                  </p>
                  <h2 className="mt-1 font-serif text-3xl font-semibold">
                    Add a task
                  </h2>
                </div>
                <button
                  type="button"
                  aria-label="Close task form"
                  className="text-2xl leading-none text-slate-400 transition hover:text-white"
                  onClick={() => setVisibility(false)}
                >
                  ×
                </button>
              </div>
              <AddTask onAddTask={addTask} />
            </aside>
          ) : (
            <aside className="h-fit rounded-3xl border border-amber-200 bg-amber-50 p-6 lg:order-first">
              <p className="text-sm font-bold uppercase tracking-wider text-amber-700">
                A gentle nudge
              </p>
              <h2 className="mt-2 font-serif text-3xl font-semibold text-slate-950">
                What deserves your attention?
              </h2>
              <p className="mt-3 leading-7 text-slate-600">
                Turn a thought into a next step and give it a place on your
                list.
              </p>
              <Button
                className="mt-6 w-full bg-amber-500 text-slate-950 hover:bg-amber-400"
                onClick={() => setVisibility(true)}
              >
                Create a task
              </Button>
            </aside>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;
