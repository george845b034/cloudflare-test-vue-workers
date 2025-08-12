import type { Env } from '../types';
import { setKv, getKv, deleteKv, listKv } from '../controllers/kvController';
import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import {
  ErrorSchema,
  KvKeyParamSchema,
  KvSetBodySchema,
  KvGetQuerySchema,
  KvGetResponseSchema,
  KvListQuerySchema,
  KvListResponseSchema,
  MessageResponseSchema,
} from '../openapi';

const app = new OpenAPIHono<{ Bindings: Env }>();

const setRoute = createRoute({
  method: 'post',
  path: '/set',
  request: { body: { content: { 'application/json': { schema: KvSetBodySchema } }, required: true } },
  responses: {
    200: { description: 'OK', content: { 'application/json': { schema: MessageResponseSchema } } },
    400: { description: 'Bad Request', content: { 'application/json': { schema: ErrorSchema } } },
    500: { description: 'Server Error', content: { 'application/json': { schema: ErrorSchema } } },
  },
});
app.openapi(setRoute, setKv as any);

const getRoute = createRoute({
  method: 'get',
  path: '/get/{key}',
  request: { params: KvKeyParamSchema, query: KvGetQuerySchema },
  responses: {
    200: { description: 'Get value', content: { 'application/json': { schema: KvGetResponseSchema } } },
    400: { description: 'Bad Request', content: { 'application/json': { schema: ErrorSchema } } },
    404: { description: 'Not Found', content: { 'application/json': { schema: ErrorSchema } } },
    500: { description: 'Server Error', content: { 'application/json': { schema: ErrorSchema } } },
  },
});
app.openapi(getRoute, getKv as any);

const deleteRoute = createRoute({
  method: 'delete',
  path: '/{key}',
  request: { params: KvKeyParamSchema },
  responses: {
    200: { description: 'Deleted', content: { 'application/json': { schema: MessageResponseSchema } } },
    400: { description: 'Bad Request', content: { 'application/json': { schema: ErrorSchema } } },
    500: { description: 'Server Error', content: { 'application/json': { schema: ErrorSchema } } },
  },
});
app.openapi(deleteRoute, deleteKv as any);

const listRoute = createRoute({
  method: 'get',
  path: '/list',
  request: { query: KvListQuerySchema },
  responses: {
    200: { description: 'List keys', content: { 'application/json': { schema: KvListResponseSchema } } },
    500: { description: 'Server Error', content: { 'application/json': { schema: ErrorSchema } } },
  },
});
app.openapi(listRoute, listKv as any);

export default app;


