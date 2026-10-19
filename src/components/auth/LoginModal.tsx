
import { useState, type FormEvent } from "react";
import { loginUser } from "../../api/auth";

interface LoginModalProps {
  onClose: () => void;
  onSwitchToRegister: () => void;
  onLoginSuccess?: () => void;
}

export default function LoginModal({
  onClose,
  onSwitchToRegister,
  onLoginSuccess,
}: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await loginUser({ email, password });

      localStorage.setItem("access_token", result.access);
      localStorage.setItem("refresh_token", result.refresh);
      localStorage.setItem("user", JSON.stringify(result.user));

      onClose();
      onLoginSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-gray-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        className="my-auto w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="relative bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-7 text-white">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close login"
            className="absolute right-4 top-4 rounded-full p-2 text-white/90 transition hover:bg-white/20"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" className="h-5 w-5">
              <path d="m18 6-12 12M6 6l12 12" />
            </svg>
          </button>

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-100">
            Welcome back
          </p>
          <h2 id="login-title" className="mt-2 text-2xl font-bold">
            Login to your account
          </h2>
          <p className="mt-2 text-sm text-orange-50">
            Sign in to continue your journey with Arsha Vijnana Trust.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-8">
          {error && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="loginEmail" className="mb-2 block text-sm font-semibold text-gray-700">
              Email address
            </label>
            <input
              id="loginEmail"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
            />
          </div>

          <div>
            <label htmlFor="loginPassword" className="mb-2 block text-sm font-semibold text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                id="loginPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-16 text-sm outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 text-xs font-semibold text-orange-700 hover:text-orange-800"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white shadow-md shadow-orange-600/20 transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {loading ? "Signing in..." : "Login"}
          </button>

          <p className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="font-semibold text-orange-600 hover:text-orange-700 hover:underline"
            >
              Register
            </button>
          </p>
        </form>
      </section>
    </div>
  );
}
