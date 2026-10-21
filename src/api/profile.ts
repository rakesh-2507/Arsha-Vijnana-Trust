
export interface Profile {
  id?: number | string;
  name?: string;
  email?: string;
  phone?: string;
  [key: string]: unknown;
}
