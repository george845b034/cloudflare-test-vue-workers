import { cors } from 'hono/cors';
import type { Env } from './types';
import kvRoutes from './routes/kvRoutes';
import todoRoutes from './routes/todoRoutes';
import { OpenAPIHono } from '@hono/zod-openapi';

// 建立 OpenAPIHono 作為根應用程式
const app = new OpenAPIHono<{ Bindings: Env }>();

// 啟用 CORS
app.use('*', cors());

// 健康檢查（維持 /api 路徑前綴）
app.get('/api', (c) => c.json({ message: 'Todo API is running!' }));
app.get('/api/', (c) => c.json({ message: 'Todo API is running!' }));

// 掛載業務路由（維持原有 /api 前綴）
app.route('/api/kv', kvRoutes);
app.route('/api/todos', todoRoutes);

// OpenAPI 文件 (v3.1) - 直接在根掛載 /api/doc
app.doc('/api/doc', (c) => ({
  openapi: '3.0.0',
  info: { version: '1.0.0', title: 'Test Vue Workers API' },
  servers: [
    { url: new URL(c.req.url).origin, description: 'Current environment' },
  ],
}));

// 相容舊習慣：/api/doc 轉址到 /doc
// app.get('/api/doc', (c) => c.redirect('/doc'));

// 處理靜態檔案和 SPA 路由
app.get('*', async (c) => {
  try {
    const response = await c.env.ASSETS.fetch(c.req.raw);
    if (response.status !== 404) {
      return response;
    }

    const indexResponse = await c.env.ASSETS.fetch(new Request(new URL('/', c.req.url)));
    return indexResponse;
  } catch (error) {
    return c.notFound();
  }
});

export default app;
