const API_BASE_URL = "https://arshavijnana.sidpz.com/api";

type QueryValue = string | number | boolean | null | undefined;

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  query?: Record<string, QueryValue>;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { query, body, headers, ...requestOptions } = options;

  const url = new URL(`${API_BASE_URL}/${endpoint.replace(/^\/+/, "")}`);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  const token =
    localStorage.getItem("access_token") ?? localStorage.getItem("token");

  const requestHeaders = new Headers(headers);

  if (body !== undefined && !(body instanceof FormData)) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url.toString(), {
    ...requestOptions,
    headers: requestHeaders,
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
          ? body
          : JSON.stringify(body),
  });

  if (!response.ok) {
    const message = await response.text();

    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    return (await response.text()) as T;
  }

  return (await response.json()) as T;
}

export const apiGet = <T>(
  endpoint: string,
  query?: Record<string, QueryValue>,
) => apiRequest<T>(endpoint, { method: "GET", query });

export const apiPost = <T>(endpoint: string, body?: unknown) =>
  apiRequest<T>(endpoint, { method: "POST", body });

export const apiPut = <T>(endpoint: string, body?: unknown) =>
  apiRequest<T>(endpoint, { method: "PUT", body });

export const apiPatch = <T>(endpoint: string, body?: unknown) =>
  apiRequest<T>(endpoint, { method: "PATCH", body });

export const apiDelete = <T = void>(endpoint: string) =>
  apiRequest<T>(endpoint, { method: "DELETE" });
