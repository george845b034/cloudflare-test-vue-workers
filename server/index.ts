import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';
import kvRoutes from './routes/kvRoutes';
import todoRoutes from './routes/todoRoutes';

// 建立 Hono 應用程式
const app = new Hono<{ Bindings: Env }>();

// 啟用 CORS
app.use('*', cors());

// API 路由容器
const api = new Hono<{ Bindings: Env }>();

// 健康檢查
api.get('/', (c) => {
  return c.json({ message: 'Todo API is running!' });
});

// 掛載業務路由（維持原有路徑）
api.route('/kv', kvRoutes);
api.route('/todos', todoRoutes);

// 將 API 路由掛載到 /api 路徑
app.route('/api', api);

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
