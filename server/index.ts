import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env, Todo } from './types';

// 建立 Hono 應用程式
const app = new Hono<{ Bindings: Env }>();

// 啟用 CORS
app.use('*', cors());

// API 路由
const api = new Hono<{ Bindings: Env }>();

// 健康檢查
api.get('/', (c) => {
	return c.json({ message: 'Todo API is running!' });
});

// 取得所有 todos
api.get('/todos', async (c) => {
	try {
		const { results } = await c.env.DB.prepare(
			'SELECT * FROM todos ORDER BY created_at DESC'
		).all<Todo>();
		
		return c.json({ todos: results });
	} catch (error) {
		return c.json({ error: 'Failed to fetch todos' }, 500);
	}
});

// 取得單一 todo
api.get('/todos/:id', async (c) => {
	try {
		const id = c.req.param('id');
		const result = await c.env.DB.prepare(
			'SELECT * FROM todos WHERE id = ?'
		).bind(id).first<Todo>();
		
		if (!result) {
			return c.json({ error: 'Todo not found' }, 404);
		}
		
		return c.json({ todo: result });
	} catch (error) {
		return c.json({ error: 'Failed to fetch todo' }, 500);
	}
});

// 建立新 todo
api.post('/todos', async (c) => {
	try {
		const body = await c.req.json<Omit<Todo, 'id' | 'created_at' | 'updated_at'>>();
		
		if (!body.title) {
			return c.json({ error: 'Title is required' }, 400);
		}
		
		const result = await c.env.DB.prepare(
			'INSERT INTO todos (title, description, completed) VALUES (?, ?, ?) RETURNING *'
		).bind(body.title, body.description || '', body.completed || false).first<Todo>();
		
		return c.json({ todo: result }, 201);
	} catch (error) {
		return c.json({ error: 'Failed to create todo' }, 500);
	}
});

// 更新 todo
api.put('/todos/:id', async (c) => {
	try {
		const id = c.req.param('id');
		const body = await c.req.json<Partial<Todo>>();
		
		// 檢查 todo 是否存在
		const existing = await c.env.DB.prepare(
			'SELECT * FROM todos WHERE id = ?'
		).bind(id).first<Todo>();
		
		if (!existing) {
			return c.json({ error: 'Todo not found' }, 404);
		}
		
		// 更新 todo
		const result = await c.env.DB.prepare(
			`UPDATE todos 
			 SET title = COALESCE(?, title), 
			     description = COALESCE(?, description), 
			     completed = COALESCE(?, completed),
			     updated_at = CURRENT_TIMESTAMP
			 WHERE id = ? 
			 RETURNING *`
		).bind(body.title, body.description, body.completed, id).first<Todo>();
		
		return c.json({ todo: result });
	} catch (error) {
		return c.json({ error: 'Failed to update todo' }, 500);
	}
});

// 刪除 todo
api.delete('/todos/:id', async (c) => {
	try {
		const id = c.req.param('id');
		
		// 檢查 todo 是否存在
		const existing = await c.env.DB.prepare(
			'SELECT * FROM todos WHERE id = ?'
		).bind(id).first<Todo>();
		
		if (!existing) {
			return c.json({ error: 'Todo not found' }, 404);
		}
		
		// 刪除 todo
		await c.env.DB.prepare(
			'DELETE FROM todos WHERE id = ?'
		).bind(id).run();
		
		return c.json({ message: 'Todo deleted successfully' });
	} catch (error) {
		return c.json({ error: 'Failed to delete todo' }, 500);
	}
});

// 切換 todo 完成狀態
api.patch('/todos/:id/toggle', async (c) => {
	try {
		const id = c.req.param('id');
		
		// 檢查 todo 是否存在
		const existing = await c.env.DB.prepare(
			'SELECT * FROM todos WHERE id = ?'
		).bind(id).first<Todo>();
		
		if (!existing) {
			return c.json({ error: 'Todo not found' }, 404);
		}
		
		// 切換完成狀態
		const result = await c.env.DB.prepare(
			`UPDATE todos 
			 SET completed = NOT completed, 
			     updated_at = CURRENT_TIMESTAMP
			 WHERE id = ? 
			 RETURNING *`
		).bind(id).first<Todo>();
		
		return c.json({ todo: result });
	} catch (error) {
		return c.json({ error: 'Failed to toggle todo' }, 500);
	}
});

// 將 API 路由掛載到 /api 路徑
app.route('/api', api);

// 處理靜態檔案和 SPA 路由
app.get('*', async (c) => {
	try {
		// 嘗試從 ASSETS 獲取靜態檔案
		const response = await c.env.ASSETS.fetch(c.req.raw);
		
		// 如果檔案存在，返回檔案
		if (response.status !== 404) {
			return response;
		}
		
		// 如果檔案不存在，返回 index.html（SPA 路由）
		const indexResponse = await c.env.ASSETS.fetch(new Request(new URL('/', c.req.url)));
		return indexResponse;
	} catch (error) {
		// 如果出錯，返回 404
		return c.notFound();
	}
});

export default app;
