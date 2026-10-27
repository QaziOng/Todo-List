import { useEffect, useRef, useState } from "react";
import TaskForm from "./components/TaskForm.tsx";
import TaskList from "./components/TaskList.tsx";
import Button from "./components/Button.tsx";
import LoginForm from "./components/login/loginForm.tsx";
import SignupForm from "./components/signup/singupForm.tsx";

export type Task = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  image: string | null;
};

type ServerTask = {
  id: number;
  title: string;
  description: string | null;
  completed: boolean | 0 | 1;
  image_key: string | null;
};

type screen = "login" | "signup" | "tasks" | "checking" | "check-error";

const imageUrlFor = (imageKey: string | null) =>
  imageKey
    ? `http://localhost:3000/uploads/${encodeURIComponent(imageKey)}`
    : null;

const App = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [visibility, setVisibility] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const taskDialogRef = useRef<HTMLDialogElement>(null);
  const [screen, setScreen] = useState<screen>("checking");
  const [authCheckError, setAuthCheckError] = useState("");
  const [logoutError, setLogoutError] = useState("");
  const [taskError, setTaskError] = useState("");

  useEffect(() => {
    const dialog = taskDialogRef.current;
    if (!dialog) return;

    if (visibility && !dialog.open) {
      dialog.showModal();
    } else if (!visibility && dialog.open) {
      dialog.close();
    }
  }, [visibility]);

  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/v1/auth/me", {
          credentials: "include",
        });

        if (cancelled) return;

        if (response.ok) {
          setScreen("tasks");
        } else if (response.status === 401) {
          setScreen("login");
        } else {
          setAuthCheckError("Could not check your login. Please try again");
          setScreen("check-error");
        }
      } catch {
        if (!cancelled) {
          setAuthCheckError("Could not connect to the server.");
          setScreen("check-error");
        }
      }
    };

    void checkSession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (screen !== "tasks") return;
    let cancelled = false;

    setTaskError("");

    const fetchTasks = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/v1/tasks", {
          method: "GET",
          credentials: "include",
        });

        if (cancelled) return;

        if (!response.ok) {
          throw new Error("Failed to pull task database from the server!");
        }
        const data: { message: string; tasks: ServerTask[] } =
          await response.json();
        setTasks(
          data.tasks.map((task) => ({
            id: task.id,
            title: task.title,
            description: task.description ?? "",
            completed: Boolean(task.completed),
            image: imageUrlFor(task.image_key),
          })),
        );
      } catch (err) {
        if (!cancelled) {
          setTaskError(
            err instanceof Error ? err.message : "Could not load Tasks.",
          );
        }
      }
    };

    void fetchTasks();

    return () => {
      cancelled = true;
    };
  }, [screen]);

  const addTask = (
    id: number,
    title: string,
    description: string,
    completed: boolean,
    image: string | null,
  ) => {
    const newTask: Task = {
      id,
      title,
      description,
      completed,
      image,
    };

    setTasks((previousTask) => [...previousTask, newTask]);
  };

  const handleEdit = (tasks: Task) => {
    setEditingTask(tasks);
    setVisibility(true);
  };

  const handleCreate = () => {
    setEditingTask(null);
    setVisibility(true);
  };

  const handleCloseTaskDialog = () => {
    setVisibility(false);
    setEditingTask(null);
  };

  const updateTask = (
    id: number,
    title: string,
    description: string,
    completed: boolean,
    image: string | null,
  ) => {
    setTasks((previousTask) =>
      previousTask.map((task) =>
        task.id === id
          ? {
              ...task,
              title,
              description,
              completed,
              image,
            }
          : task,
      ),
    );
    setEditingTask(null);
  };

  const handleToggleComplete = async (id: number) => {
    setTaskError("");

    const task = tasks.find((task) => task.id === id);
    if (!task) {
      setTaskError("Could not find that task.");
      return;
    }

    const completed = !task.completed;

    try {
      const response = await fetch(`http://localhost:3000/api/v1/tasks/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          completed,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message ?? "Updating task failed.");
      }

      setTasks((previousTask) =>
        previousTask.map((currentTask) =>
          currentTask.id === id
            ? {
                ...currentTask,
                completed,
              }
            : currentTask,
        ),
      );
    } catch (err) {
      setTaskError(
        err instanceof Error ? err.message : "Could not connect to server.",
      );
    }
  };

  const deleteTask = async (id: number) => {
    setTaskError("");

    try {
      const response = await fetch(`http://localhost:3000/api/v1/tasks/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message ?? "Task deletion failed.");
      }

      setTasks((previousTasks) =>
        previousTasks.filter((task) => task.id !== id),
      );
    } catch (err) {
      setTaskError(
        err instanceof Error ? err.message : "Could not connect to server.",
      );
    }
  };

  const handleLogout = async () => {
    setLogoutError("");

    try {
      const response = await fetch("http://localhost:3000/api/v1/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed. Please try again.");
      }

      setScreen("login");
    } catch (error) {
      setLogoutError(
        error instanceof Error
          ? error.message
          : "Could not connect to the server.",
      );
    }
  };

  if (screen === "checking") {
    return <main className="p-8">Checking your session...</main>;
  }

  if (screen === "check-error") {
    return (
      <main>
        {authCheckError}
        <Button type="button" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </main>
    );
  }

  if (screen === "login") {
    return (
      <LoginForm
        onShowSignup={() => setScreen("signup")}
        onLoginSuccess={() => setScreen("tasks")}
      />
    );
  }
  if (screen === "signup") {
    return <SignupForm onShowLogin={() => setScreen("login")} />;
  }

  return (
    <main className="min-h-screen bg-[#f5f7f2] px-4 py-8 text-slate-900 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-col gap-6 border-b border-slate-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-teal-700">
              Personal workspace
            </p>
            <h1 className="font-serif text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
              Make Room For <span className="text-amber-600">Progress.</span>
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
              onClick={handleCreate}
            >
              + New task
            </Button>
            <Button
              className="bg-slate-200 text-slate-900 hover:bg-slate-300"
              onClick={handleLogout}
            >
              Log out
            </Button>
          </div>
        </header>

        {logoutError && (
          <p role="alert" className="mb-6 text-sm text-red-700">
            {logoutError}
          </p>
        )}

        {taskError && (
          <p
            role="alert"
            className="mb-6 p-4 rounded-xl bg-red-50 text-sm text-red-700 border border-red-200"
          >
            {taskError}
          </p>
        )}

        <section className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]">
          <TaskList
            tasks={tasks}
            onDelete={deleteTask}
            onEdit={handleEdit}
            onToggleComplete={handleToggleComplete}
          />

          <aside className="h-fit rounded-3xl border border-amber-200 bg-amber-50 p-6">
            <p className="text-sm font-bold uppercase tracking-wider text-amber-700">
              A gentle nudge
            </p>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-slate-950">
              What deserves your attention?
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              Turn a thought into a next step and give it a place on your list.
            </p>
            <Button
              className="mt-6 w-full bg-amber-500 text-slate-950 hover:bg-amber-400"
              onClick={handleCreate}
            >
              Create a task
            </Button>
          </aside>
        </section>

        <dialog
          aria-labelledby="task-dialog-title"
          className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-3xl border border-slate-700 bg-slate-950 p-6 text-white shadow-2xl backdrop:bg-slate-950/60"
          onClose={handleCloseTaskDialog}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              taskDialogRef.current?.close();
            }
          }}
          ref={taskDialogRef}
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-400">
                New focus
              </p>
              <h2
                className="mt-1 font-serif text-3xl font-semibold"
                id="task-dialog-title"
              >
                {editingTask ? "Edit task" : "Add a task"}
              </h2>
            </div>
            <button
              type="button"
              aria-label="Close task form"
              className="text-2xl leading-none text-slate-400 transition hover:text-white"
              onClick={handleCloseTaskDialog}
            >
              ×
            </button>
          </div>
          {visibility && (
            <TaskForm
              onAddTask={addTask}
              onUpdateTask={updateTask}
              taskToEdit={editingTask}
              visibility={handleCloseTaskDialog}
            />
          )}
        </dialog>
      </div>
    </main>
  );
};

export default App;
