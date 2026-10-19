
import { useState, type FormEvent } from "react";
import { registerUser } from "../../api/auth";

interface RegisterModalProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function RegisterModal({
  onClose,
  onSwitchToLogin,
}: RegisterModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        confirm_password: confirmPassword,
      });

      setSuccess("Registration successful! You can now log in.");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to register your account.",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100";

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
        aria-labelledby="register-title"
        className="my-auto w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="relative bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-6 text-white sm:px-8">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close registration"
            className="absolute right-4 top-4 rounded-full p-2 text-white/90 transition hover:bg-white/20"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" className="h-5 w-5">
              <path d="m18 6-12 12M6 6l12 12" />
            </svg>
          </button>

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-100">
            Join our community
          </p>
          <h2 id="register-title" className="mt-2 text-2xl font-bold">
            Create an account
          </h2>
          <p className="mt-2 text-sm text-orange-50">
            Register to explore books and access your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6 sm:p-8">
          {error && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div role="status" className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="ml-1 font-semibold underline"
              >
                Login now
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="mb-2 block text-sm font-semibold text-gray-700">
                First name
              </label>
              <input
                id="firstName"
                type="text"
                autoComplete="given-name"
                required
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder="First name"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="lastName" className="mb-2 block text-sm font-semibold text-gray-700">
                Last name
              </label>
              <input
                id="lastName"
                type="text"
                autoComplete="family-name"
                required
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                placeholder="Last name"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="registerEmail" className="mb-2 block text-sm font-semibold text-gray-700">
              Email address
            </label>
            <input
              id="registerEmail"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="registerPhone" className="mb-2 block text-sm font-semibold text-gray-700">
              Phone number
            </label>
            <input
              id="registerPhone"
              type="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Enter phone number"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="registerPassword" className="mb-2 block text-sm font-semibold text-gray-700">
              Password
            </label>
            <input
              id="registerPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-gray-700">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Re-enter your password"
              className={inputClass}
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(event) => setShowPassword(event.target.checked)}
              className="h-4 w-4 accent-orange-600"
            />
            Show passwords
          </label>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white shadow-md shadow-orange-600/20 transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-semibold text-orange-600 hover:text-orange-700 hover:underline"
            >
              Login
            </button>
          </p>
        </form>
      </section>
    </div>
  );
}
