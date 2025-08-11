import type { Env } from '../types';
import type { Context } from 'hono';
import { deleteKey, getJson, getText, listKeys, putValue } from '../repositories/kvRepository';

type AppContext = Context<{ Bindings: Env }>;

export async function setKv(c: AppContext) {
  try {
    const body = await c.req.json<{
      key: string;
      value: unknown;
      as?: 'text' | 'json';
      ttl?: number;
      metadata?: Record<string, unknown>;
    }>();

    if (!body || !body.key) {
      return c.json({ error: 'key 為必填' }, 400);
    }

    const { key } = body;
    const as = body.as ?? 'text';
    const ttl = typeof body.ttl === 'number' && body.ttl > 0 ? body.ttl : undefined;
    const metadata = body.metadata && typeof body.metadata === 'object' ? body.metadata : undefined;

    try {
      await putValue(c.env.KV, { key, value: body.value, as, ttl, metadata });
    } catch (e) {
      if (e instanceof Error && e.message === 'INVALID_JSON') {
        return c.json({ error: 'value 不是有效的 JSON 字串' }, 400);
      }
      throw e;
    }

    return c.json({ message: 'OK' });
  } catch (err) {
    return c.json({ error: 'KV set 失敗' }, 500);
  }
}

export async function getKv(c: AppContext) {
  try {
    const key = c.req.param('key');
    const type = (c.req.query('type') as 'text' | 'json' | undefined) ?? 'text';
    if (!key) return c.json({ error: 'key 為必填' }, 400);

    if (type === 'json') {
      const { value, metadata } = await getJson<any>(c.env.KV, key);
      if (value === null || value === undefined) return c.json({ error: 'Not Found' }, 404);
      return c.json({ value, metadata });
    }

    const { value, metadata } = await getText(c.env.KV, key);
    if (value === null || value === undefined) return c.json({ error: 'Not Found' }, 404);
    return c.json({ value, metadata });
  } catch (err) {
    return c.json({ error: 'KV get 失敗' }, 500);
  }
}

export async function deleteKv(c: AppContext) {
  try {
    const key = c.req.param('key');
    if (!key) return c.json({ error: 'key 為必填' }, 400);
    await deleteKey(c.env.KV, key);
    return c.json({ message: 'Deleted' });
  } catch (err) {
    return c.json({ error: 'KV delete 失敗' }, 500);
  }
}

export async function listKv(c: AppContext) {
  try {
    const prefix = c.req.query('prefix') ?? undefined;
    const cursor = c.req.query('cursor') ?? undefined;
    const limitStr = c.req.query('limit');
    const limit = limitStr ? Math.max(1, Math.min(1000, Number(limitStr))) : undefined;
    const result = await listKeys(c.env.KV, { prefix, cursor, limit });
    return c.json(result);
  } catch (err) {
    return c.json({ error: 'KV list 失敗' }, 500);
  }
}


