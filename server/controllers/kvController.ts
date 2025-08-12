import type { Env } from '../types';
import type { Context } from 'hono';
import { deleteKey, getJson, getText, listKeys, putValue } from '../repositories/kvRepository';

type AppContext = Context<{ Bindings: Env }>;

export async function setKv(c: AppContext) {
  try {
    const body = (c.req as any).valid('json') as {
      key: string;
      value: unknown;
      as?: 'text' | 'json';
      ttl?: number;
      metadata?: Record<string, unknown>;
    };

    const { key } = body;
    const as = body.as ?? 'text';
    const ttl = typeof body.ttl === 'number' && body.ttl > 0 ? body.ttl : undefined;
    const metadata = body.metadata && typeof body.metadata === 'object' ? body.metadata : undefined;

    try {
      await putValue(c.env.KV, { key, value: body.value, as, ttl, metadata });
    } catch (e) {
      if (e instanceof Error && e.message === 'INVALID_JSON') {
        return c.json({ code: 400, message: 'value 不是有效的 JSON 字串' }, 400);
      }
      throw e;
    }

    return c.json({ message: 'OK' });
  } catch (err) {
    return c.json({ code: 500, message: 'KV set 失敗' }, 500);
  }
}

export async function getKv(c: AppContext) {
  try {
    const key = c.req.param('key');
    const { type = 'text' } = ((c.req as any).valid('query') as { type?: 'text' | 'json' }) ?? {};
    if (!key) return c.json({ code: 400, message: 'key 為必填' }, 400);

    if (type === 'json') {
      const { value, metadata } = await getJson<any>(c.env.KV, key);
      if (value === null || value === undefined) return c.json({ code: 404, message: 'Not Found' }, 404);
      return c.json({ value, metadata }, 200);
    }

    const { value, metadata } = await getText(c.env.KV, key);
    if (value === null || value === undefined) return c.json({ code: 404, message: 'Not Found' }, 404);
    return c.json({ value, metadata }, 200);
  } catch (err) {
    return c.json({ code: 500, message: 'KV get 失敗' }, 500);
  }
}

export async function deleteKv(c: AppContext) {
  try {
    const key = c.req.param('key');
    if (!key) return c.json({ code: 400, message: 'key 為必填' }, 400);
    await deleteKey(c.env.KV, key);
    return c.json({ message: 'Deleted' }, 200);
  } catch (err) {
    return c.json({ code: 500, message: 'KV delete 失敗' }, 500);
  }
}

export async function listKv(c: AppContext) {
  try {
    const { prefix, cursor, limit } = ((c.req as any).valid('query') as {
      prefix?: string;
      cursor?: string;
      limit?: number;
    }) ?? {};
    const result = await listKeys(c.env.KV, { prefix, cursor, limit });
    return c.json(result, 200);
  } catch (err) {
    return c.json({ code: 500, message: 'KV list 失敗' }, 500);
  }
}


