# Cloudflare Vue Workers 測試專案

這個專案用來測試 Cloudflare Workers、Pages 和 D1 的整合。

## 專案結構

```
test_vue_workers/
├── frontend/          # Vue.js 前端
├── server/            # Cloudflare Workers (Hono)
│   ├── index.ts       # 主要 API 檔案
│   ├── types.ts       # TypeScript 類型定義
│   └── api-test.http  # API 測試檔案
├── database/          # D1 資料庫相關
│   └── schema.sql     # 資料庫 schema
├── migrations/        # D1 遷移檔案
├── wrangler.jsonc     # Cloudflare 配置
└── README.md
```

## 技術棧

- **前端**: Vue.js 3
- **後端**: Cloudflare Workers + Hono
- **資料庫**: Cloudflare D1 (SQLite)
- **部署**: Cloudflare Pages

## 快速開始

### 1. 安裝 Wrangler CLI
```bash
npm install -g wrangler
```

### 2. 登入 Cloudflare
```bash
wrangler login
```

### 3. 安裝依賴
```bash
npm install
```

### 4. 啟動開發環境
```bash
# 啟動 Workers 開發環境
wrangler dev

# 啟動前端開發環境
npm run dev
```

## Todo API 端點

### 基礎端點
- `GET /` - 健康檢查
- `GET /api/todos` - 取得所有 todos
- `GET /api/todos/:id` - 取得單一 todo
- `POST /api/todos` - 建立新 todo
- `PUT /api/todos/:id` - 更新 todo
- `DELETE /api/todos/:id` - 刪除 todo
- `PATCH /api/todos/:id/toggle` - 切換 todo 完成狀態

### Todo 資料結構
```typescript
interface Todo {
  id?: number;
  title: string;
  description?: string;
  completed: boolean;
  created_at?: string;
  updated_at?: string;
}
```

### 範例請求

#### 建立新 todo
```bash
curl -X POST http://localhost:8787/api/todos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "學習 Cloudflare Workers",
    "description": "使用 Hono 框架建立 API",
    "completed": false
  }'
```

#### 取得所有 todos
```bash
curl http://localhost:8787/api/todos
```

#### 切換 todo 完成狀態
```bash
curl -X PATCH http://localhost:8787/api/todos/1/toggle
```

## 資料庫管理

### 執行遷移
```bash
# 本地開發
wrangler d1 migrations apply todo-database

# 生產環境
wrangler d1 migrations apply todo-database --remote
```

### 查看資料庫
```bash
wrangler d1 execute todo-database --command "SELECT * FROM todos;"
```

## 有用的連結

- [Cloudflare Workers 文檔](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages 文檔](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 文檔](https://developers.cloudflare.com/d1/)
- [Hono 框架文檔](https://hono.dev/)
