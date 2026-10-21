
export interface Order {
  id: number | string;
  status?: string;
  total?: number;
  created_at?: string;
  [key: string]: unknown;
}

