import type { Todo, TodoResponse } from '@/types/todo';

const API_BASE = '/api';

export class TodoApi {
  // 取得所有 todos
  static async getAllTodos(): Promise<Todo[]> {
    try {
      const response = await fetch(`${API_BASE}/todos`);
      const data: TodoResponse = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      return data.todos || [];
    } catch (error) {
      console.error('Failed to fetch todos:', error);
      throw error;
    }
  }

  // 取得單一 todo
  static async getTodo(id: number): Promise<Todo> {
    try {
      const response = await fetch(`${API_BASE}/todos/${id}`);
      const data: TodoResponse = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (!data.todo) {
        throw new Error('Todo not found');
      }
      
      return data.todo;
    } catch (error) {
      console.error('Failed to fetch todo:', error);
      throw error;
    }
  }

  // 建立新 todo
  static async createTodo(todo: Omit<Todo, 'id' | 'created_at' | 'updated_at'>): Promise<Todo> {
    try {
      const response = await fetch(`${API_BASE}/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(todo),
      });
      
      const data: TodoResponse = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (!data.todo) {
        throw new Error('Failed to create todo');
      }
      
      return data.todo;
    } catch (error) {
      console.error('Failed to create todo:', error);
      throw error;
    }
  }

  // 更新 todo
  static async updateTodo(id: number, todo: Partial<Todo>): Promise<Todo> {
    try {
      const response = await fetch(`${API_BASE}/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(todo),
      });
      
      const data: TodoResponse = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (!data.todo) {
        throw new Error('Failed to update todo');
      }
      
      return data.todo;
    } catch (error) {
      console.error('Failed to update todo:', error);
      throw error;
    }
  }

  // 刪除 todo
  static async deleteTodo(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/todos/${id}`, {
        method: 'DELETE',
      });
      
      const data: TodoResponse = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Failed to delete todo:', error);
      throw error;
    }
  }

  // 切換 todo 完成狀態
  static async toggleTodo(id: number): Promise<Todo> {
    try {
      const response = await fetch(`${API_BASE}/todos/${id}/toggle`, {
        method: 'PATCH',
      });
      
      const data: TodoResponse = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (!data.todo) {
        throw new Error('Failed to toggle todo');
      }
      
      return data.todo;
    } catch (error) {
      console.error('Failed to toggle todo:', error);
      throw error;
    }
  }
}
