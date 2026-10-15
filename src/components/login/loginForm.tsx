import { useState, type FormEvent } from "react";
import Button from "../Button";

type LoginFormProps = {
  onShowSignup: () => void;
};

const LoginForm = ({ onShowSignup }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await fetch("http://localhost:3000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message ?? "Signup failed!");
      }

      setMessage("Account logged in Successfully");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not connect to server",
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f7f2] px-4 py-12">
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-md space-y-5 rounded-3xl bg-white p-8 shadow-lg"
      >
        <h1 className="font-serif text-3xl font-semibold">Welcome Back</h1>
        <label className="block text-sm font-semibold">
          Email
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
          />
        </label>
        <label className="block text-sm font-semibold">
          Password
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
          />
        </label>
        <Button
          type="submit"
          className="w-full rounded-xl bg-teal-700 px-5 py-3 font-bold text-white hover:bg-teal-800"
        >
          Log In
        </Button>
        <Button type="button" onClick={onShowSignup}>
          Create an account
        </Button>
      </form>
    </main>
  );
};

export default LoginForm;
