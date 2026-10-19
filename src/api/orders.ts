
export interface Order {
  id: number | string;
  status?: string;
  total?: number;
  created_at?: string;
  [key: string]: unknown;
}

// Add order history, order detail and checkout functions
// after confirming the backend endpoints.
