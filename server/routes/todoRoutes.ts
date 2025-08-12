import type { Env } from '../types';
import { listTodos, getTodo, createTodo, updateTodo, deleteTodo, toggleTodo } from '../controllers/todoController';
import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import {
  ErrorSchema,
  IdParamSchema,
  TodoCreateSchema,
  TodoResponseSchema,
  TodosResponseSchema,
  TodoUpdateSchema,
  MessageResponseSchema,
} from '../openapi';

const app = new OpenAPIHono<{ Bindings: Env }>();

const listRoute = createRoute({
  method: 'get',
  path: '/',
  responses: {
    200: { description: 'List todos', content: { 'application/json': { schema: TodosResponseSchema } } },
    500: { description: 'Server Error', content: { 'application/json': { schema: ErrorSchema } } },
  },
});

app.openapi(listRoute, listTodos as any);

const getRoute = createRoute({
  method: 'get',
  path: '/{id}',
  request: { params: IdParamSchema },
  responses: {
    200: { description: 'Get todo', content: { 'application/json': { schema: TodoResponseSchema } } },
    404: { description: 'Not found', content: { 'application/json': { schema: ErrorSchema } } },
    500: { description: 'Server Error', content: { 'application/json': { schema: ErrorSchema } } },
  },
});
app.openapi(getRoute, getTodo as any);

const createRouteDef = createRoute({
  method: 'post',
  path: '/',
  request: {
    body: {
      content: { 'application/json': { schema: TodoCreateSchema } },
      required: true,
    },
  },
  responses: {
    201: { description: 'Created', content: { 'application/json': { schema: TodoResponseSchema } } },
    400: { description: 'Bad Request', content: { 'application/json': { schema: ErrorSchema } } },
    500: { description: 'Server Error', content: { 'application/json': { schema: ErrorSchema } } },
  },
});
app.openapi(createRouteDef, createTodo as any);

const updateRoute = createRoute({
  method: 'put',
  path: '/{id}',
  request: {
    params: IdParamSchema,
    body: { content: { 'application/json': { schema: TodoUpdateSchema } }, required: true },
  },
  responses: {
    200: { description: 'Updated', content: { 'application/json': { schema: TodoResponseSchema } } },
    404: { description: 'Not found', content: { 'application/json': { schema: ErrorSchema } } },
    500: { description: 'Server Error', content: { 'application/json': { schema: ErrorSchema } } },
  },
});
app.openapi(updateRoute, updateTodo as any);

const deleteRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  request: { params: IdParamSchema },
  responses: {
    200: { description: 'Deleted', content: { 'application/json': { schema: MessageResponseSchema } } },
    404: { description: 'Not found', content: { 'application/json': { schema: ErrorSchema } } },
    500: { description: 'Server Error', content: { 'application/json': { schema: ErrorSchema } } },
  },
});
app.openapi(deleteRoute, deleteTodo as any);

const toggleRoute = createRoute({
  method: 'patch',
  path: '/{id}/toggle',
  request: { params: IdParamSchema },
  responses: {
    200: { description: 'Toggled', content: { 'application/json': { schema: TodoResponseSchema } } },
    404: { description: 'Not found', content: { 'application/json': { schema: ErrorSchema } } },
    500: { description: 'Server Error', content: { 'application/json': { schema: ErrorSchema } } },
  },
});
app.openapi(toggleRoute, toggleTodo as any);

export default app;


