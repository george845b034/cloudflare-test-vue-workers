import type { Todo } from '../types';

export async function fetchTodos(db: D1Database): Promise<Todo[]> {
  const { results } = await db
    .prepare('SELECT * FROM todos ORDER BY created_at DESC')
    .all<Todo>();
  return results;
}

export async function fetchTodoById(db: D1Database, id: string | number): Promise<Todo | null> {
  const row = await db
    .prepare('SELECT * FROM todos WHERE id = ?')
    .bind(id)
    .first<Todo>();
  return row ?? null;
}

export async function insertTodo(
  db: D1Database,
  input: Omit<Todo, 'id' | 'created_at' | 'updated_at'>
): Promise<Todo> {
  const created = await db
    .prepare('INSERT INTO todos (title, description, completed) VALUES (?, ?, ?) RETURNING *')
    .bind(input.title, input.description || '', input.completed || false)
    .first<Todo>();
  // D1 RETURNING * should always return a row
  return created as Todo;
}

export async function updateTodoRow(
  db: D1Database,
  id: string | number,
  changes: Partial<Todo>
): Promise<Todo> {
  const updated = await db
    .prepare(
      `UPDATE todos 
       SET title = COALESCE(?, title), 
           description = COALESCE(?, description), 
           completed = COALESCE(?, completed),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ? 
       RETURNING *`
    )
    .bind(changes.title, changes.description, changes.completed, id)
    .first<Todo>();
  return updated as Todo;
}

export async function deleteTodoRow(db: D1Database, id: string | number): Promise<void> {
  await db.prepare('DELETE FROM todos WHERE id = ?').bind(id).run();
}

export async function toggleTodoRow(db: D1Database, id: string | number): Promise<Todo> {
  const toggled = await db
    .prepare(
      `UPDATE todos 
       SET completed = NOT completed, 
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ? 
       RETURNING *`
    )
    .bind(id)
    .first<Todo>();
  return toggled as Todo;
}


