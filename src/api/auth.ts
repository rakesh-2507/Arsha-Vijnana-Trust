
import { apiGet, apiPost } from "./api";

export interface User {
  id?: number | string;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  [key: string]: unknown;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  confirm_password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface RegisterResponse {
  message?: string;
  detail?: string;
  user?: User;
  [key: string]: unknown;
}

/**
 * Log in with email and password.
 * Endpoint: POST /auth/login/
 */
export const loginUser = async (
  payload: LoginPayload,
): Promise<LoginResponse> => {
  const result = await apiPost<LoginResponse>("auth/login/", payload);

  if (!result?.access || !result?.refresh || !result?.user) {
    throw new Error("Invalid login response from the server.");
  }

  localStorage.setItem("access_token", result.access);
  localStorage.setItem("refresh_token", result.refresh);
  localStorage.setItem("user", JSON.stringify(result.user));

  return result;
};

/**
 * Register a new user.
 * Endpoint: POST /auth/register/
 */
export const registerUser = (
  payload: RegisterPayload,
): Promise<RegisterResponse> => {
  return apiPost<RegisterResponse>("auth/register/", payload);
};

/**
 * Log out by clearing locally stored authentication data.
 * No server logout endpoint was provided.
 */
export const logoutUser = (): void => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

/**
 * Get the currently logged-in user from localStorage.
 */
export const getCurrentUser = (): User | null => {
  const storedUser = localStorage.getItem("user");

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as User;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

/**
 * Check whether an access token is stored.
 */
export const isAuthenticated = (): boolean => {
  return Boolean(localStorage.getItem("access_token"));
};

/**
 * Optional helper to fetch the current user from the server.
 * Use only if your backend supports GET /auth/me/.
 */
export const fetchCurrentUser = () => {
  return apiGet<User>("auth/me/");
};
