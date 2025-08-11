import { Hono } from 'hono';
import type { Env } from '../types';
import { listTodos, getTodo, createTodo, updateTodo, deleteTodo, toggleTodo } from '../controllers/todoController';

const todoRoutes = new Hono<{ Bindings: Env }>();

todoRoutes.get('/', listTodos);
todoRoutes.get('/:id', getTodo);
todoRoutes.post('/', createTodo);
todoRoutes.put('/:id', updateTodo);
todoRoutes.delete('/:id', deleteTodo);
todoRoutes.patch('/:id/toggle', toggleTodo);

export default todoRoutes;


