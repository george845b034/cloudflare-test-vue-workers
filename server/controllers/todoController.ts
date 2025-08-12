import type { Env, Todo } from '../types';
import type { Context } from 'hono';
import {
  fetchTodos,
  fetchTodoById,
  insertTodo,
  updateTodoRow,
  deleteTodoRow,
  toggleTodoRow,
} from '../repositories/todoRepository';

type AppContext = Context<{ Bindings: Env }>;

export async function listTodos(c: AppContext) {
  try {
    const todos = await fetchTodos(c.env.DB);
    return c.json({ todos }, 200);
  } catch (error) {
    return c.json({ code: 500, message: 'Failed to fetch todos' }, 500);
  }
}

export async function getTodo(c: AppContext) {
  try {
    const id = c.req.param('id');
    const result = await fetchTodoById(c.env.DB, id);
    if (!result) {
      return c.json({ code: 404, message: 'Todo not found' }, 404);
    }
    return c.json({ todo: result }, 200);
  } catch (error) {
    return c.json({ code: 500, message: 'Failed to fetch todo' }, 500);
  }
}

export async function createTodo(c: AppContext) {
  try {
    // 透過 zod-openapi 的驗證：在 route 已定義 schema，這裡以 valid('json') 取得
    const body = (c.req as any).valid('json') as Omit<Todo, 'id' | 'created_at' | 'updated_at'>;
    const result = await insertTodo(c.env.DB, body);
    return c.json({ todo: result }, 201);
  } catch (error) {
    return c.json({ code: 500, message: 'Failed to create todo' }, 500);
  }
}

export async function updateTodo(c: AppContext) {
  try {
    const id = c.req.param('id');
    const body = (c.req as any).valid('json') as Partial<Todo>;

    const existing = await fetchTodoById(c.env.DB, id);
    if (!existing) {
      return c.json({ code: 404, message: 'Todo not found' }, 404);
    }

    const result = await updateTodoRow(c.env.DB, id, body);
    return c.json({ todo: result }, 200);
  } catch (error) {
    return c.json({ code: 500, message: 'Failed to update todo' }, 500);
  }
}

export async function deleteTodo(c: AppContext) {
  try {
    const id = c.req.param('id');
    const existing = await fetchTodoById(c.env.DB, id);
    if (!existing) {
      return c.json({ code: 404, message: 'Todo not found' }, 404);
    }
    await deleteTodoRow(c.env.DB, id);
    return c.json({ message: 'Todo deleted successfully' }, 200);
  } catch (error) {
    return c.json({ code: 500, message: 'Failed to delete todo' }, 500);
  }
}

export async function toggleTodo(c: AppContext) {
  try {
    const id = c.req.param('id');
    const existing = await fetchTodoById(c.env.DB, id);
    if (!existing) {
      return c.json({ code: 404, message: 'Todo not found' }, 404);
    }
    const result = await toggleTodoRow(c.env.DB, id);
    return c.json({ todo: result }, 200);
  } catch (error) {
    return c.json({ code: 500, message: 'Failed to toggle todo' }, 500);
  }
}


