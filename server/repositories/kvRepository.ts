export async function putValue(
  kv: KVNamespace,
  params: {
    key: string;
    value: unknown;
    as: 'text' | 'json';
    ttl?: number;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  const { key, value, as, ttl, metadata } = params;

  if (as === 'json') {
    let jsonValue: any = value;
    if (typeof jsonValue === 'string') {
      try {
        jsonValue = JSON.parse(jsonValue);
      } catch (e) {
        throw new Error('INVALID_JSON');
      }
    }
    await kv.put(key, JSON.stringify(jsonValue), {
      expirationTtl: ttl,
      metadata,
    });
    return;
  }

  const textValue = typeof value === 'string' ? value : String(value);
  await kv.put(key, textValue, {
    expirationTtl: ttl,
    metadata,
  });
}

export async function getText(
  kv: KVNamespace,
  key: string
): Promise<{ value: string | null; metadata: Record<string, unknown> | null }> {
  const { value, metadata } = await kv.getWithMetadata<string>(key, 'text');
  return { value, metadata: (metadata as any) ?? null };
}

export async function getJson<T = unknown>(
  kv: KVNamespace,
  key: string
): Promise<{ value: T | null; metadata: Record<string, unknown> | null }> {
  const { value, metadata } = await kv.getWithMetadata<T>(key, 'json');
  return { value, metadata: (metadata as any) ?? null };
}

export async function deleteKey(kv: KVNamespace, key: string): Promise<void> {
  await kv.delete(key);
}

export async function listKeys(
  kv: KVNamespace,
  options: { prefix?: string; cursor?: string; limit?: number }
) {
  return kv.list({ prefix: options.prefix, cursor: options.cursor, limit: options.limit });
}