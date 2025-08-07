export interface Todo {
  id?: number;
  title: string;
  description?: string;
  completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TodoResponse {
  todos?: Todo[];
  todo?: Todo;
  error?: string;
  message?: string;
}
