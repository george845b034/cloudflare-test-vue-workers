import { z } from '@hono/zod-openapi'

// Common
export const ErrorSchema = z
  .object({
    code: z.number().openapi({ example: 400 }),
    message: z.string().openapi({ example: 'Bad Request' }),
  })
  .openapi('Error')

// Path / Query common
export const IdParamSchema = z
  .object({
    id: z
      .string()
      .regex(/^\d+$/)
      .openapi({
        param: { name: 'id', in: 'path' },
        example: '1',
      }),
  })
  .openapi('IdParams')

export const KvKeyParamSchema = z
  .object({
    key: z
      .string()
      .min(1)
      .openapi({ param: { name: 'key', in: 'path' }, example: 'foo' }),
  })
  .openapi('KvKeyParams')

// Todo
export const TodoSchema = z
  .object({
    id: z.number().optional().openapi({ example: 1 }),
    title: z.string().min(1).openapi({ example: 'Buy milk' }),
    description: z.string().optional().openapi({ example: '2% milk' }),
    completed: z.boolean().openapi({ example: false }),
    created_at: z.string().optional().openapi({ example: '2024-01-01T00:00:00Z' }),
    updated_at: z.string().optional().openapi({ example: '2024-01-01T00:00:00Z' }),
  })
  .openapi('Todo')

export const TodoCreateSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().optional(),
    completed: z.boolean().optional(),
  })
  .openapi('TodoCreate')

export const TodoUpdateSchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    completed: z.boolean().optional(),
  })
  .openapi('TodoUpdate')

export const TodoResponseSchema = z
  .object({
    todo: TodoSchema.optional(),
    error: z.string().optional(),
    message: z.string().optional(),
  })
  .openapi('TodoResponse')

export const TodosResponseSchema = z
  .object({
    todos: z.array(TodoSchema).optional(),
    error: z.string().optional(),
  })
  .openapi('TodosResponse')

export const MessageResponseSchema = z
  .object({ message: z.string().openapi({ example: 'OK' }) })
  .openapi('MessageResponse')

// KV
export const KvSetBodySchema = z
  .object({
    key: z.string().min(1),
    value: z.any(),
    as: z.enum(['text', 'json']).optional().default('text'),
    ttl: z.number().int().positive().optional(),
    metadata: z.record(z.string(), z.any()).optional(),
  })
  .openapi('KvSetBody')

export const KvGetQuerySchema = z
  .object({
    type: z.enum(['text', 'json']).optional().default('text'),
  })
  .openapi('KvGetQuery')

export const KvGetResponseSchema = z
  .object({
    value: z.any(),
    metadata: z.record(z.string(), z.any()).nullable().optional(),
  })
  .openapi('KvGetResponse')

export const KvListQuerySchema = z
  .object({
    prefix: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(1000).optional(),
  })
  .openapi('KvListQuery')

export const KvListResponseSchema = z
  .object({
    keys: z
      .array(
        z.object({
          name: z.string(),
          expiration: z.number().optional(),
          metadata: z.record(z.string(), z.any()).nullable().optional(),
        })
      )
      .openapi({ example: [{ name: 'foo' }] }),
    list_complete: z.boolean(),
    cursor: z.string().optional(),
  })
  .openapi('KvListResponse')


