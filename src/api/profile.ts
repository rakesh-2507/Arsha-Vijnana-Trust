
export interface Profile {
  id?: number | string;
  name?: string;
  email?: string;
  phone?: string;
  [key: string]: unknown;
}

// Add profile fetch and update functions after confirming
// the backend endpoints.
