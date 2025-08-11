# Cloudflare Vue Workers 測試專案

以 Vue 3 + Hono (Cloudflare Workers) 實作前後端，整合 D1 與 KV，並提供 SPA 靜態資產發佈至 Workers Assets。

## 專案結構（已採用 Routes → Controllers → Repositories 分層）

```
test_vue_workers/
├── server/
│   ├── index.ts                # Workers 入口：掛載 CORS、/api、靜態資產
│   ├── types.ts                # 共用型別（Env、Todo、API 回應）
│   ├── api-test.http           # API 測試腳本
│   ├── routes/                 # 路由：僅做路由註冊
│   │   ├── kvRoutes.ts         # /api/kv/*
│   │   └── todoRoutes.ts       # /api/todos/*
│   ├── controllers/            # 控制器：解析請求/回應與業務規則
│   │   ├── kvController.ts
│   │   └── todoController.ts
│   └── repositories/           # 資料層：存取 D1/KV
│       ├── kvRepository.ts
│       └── todoRepository.ts
├── src/                        # Vue 前端（Vite）
├── public/                     # 靜態資產（開發期）
├── dist/client/                # 前端 build 輸出（被 Workers 當成 Assets）
├── database/                   # D1 相關 SQL
│   └── schema.sql
├── migrations/                 # D1 Migrations（已存在的 SQL 遷移檔）
├── wrangler.jsonc              # Workers 設定（assets/DB/KV 綁定）
└── README.md
```

## 技術棧

- 前端：Vue 3、Vite
- 後端：Cloudflare Workers + Hono
- 儲存：Cloudflare D1（SQLite）、Cloudflare KV
- 發佈：Workers（以 Assets 提供 SPA 靜態檔）

## 環境需求

- Node.js 20.19+ 或 22.12+
- Wrangler CLI

## 快速開始

1) 安裝依賴
```bash
npm install
```

2) 登入 Cloudflare（首次）
```bash
wrangler login
```

3) 開發模式
- 前端熱更新（Vite）：
```bash
npm run dev
```
- Workers 後端（需先完成一次前端 build 以提供資產給 Workers）：
```bash
npm run build-only
wrangler dev
```

4) 一鍵預覽（先 build 再啟動 Workers）
```bash
npm run preview
```

5) 部署
```bash
npm run deploy
```

## API 一覽

### 健康檢查
- `GET /api/` → `{ message: 'Todo API is running!' }`

### KV（前綴：`/api/kv`）
- `POST /set` body: `{ key, value, as?: 'text'|'json', ttl?: number, metadata?: object }`
- `GET /get/:key?type=text|json` → `{ value, metadata }`
- `GET /list?prefix&limit&cursor` → KV 列表結果
- `DELETE /:key` → 刪除 key

### Todos（前綴：`/api/todos`）
- `GET /` → 取得所有 todos
- `GET /:id` → 取得單一 todo
- `POST /` body: `{ title, description?, completed? }`
- `PUT /:id` body: `Partial<Todo>`
- `DELETE /:id`
- `PATCH /:id/toggle`

Todo 型別：
```ts
interface Todo {
  id?: number
  title: string
  description?: string
  completed: boolean
  created_at?: string
  updated_at?: string
}
```

## 測試方式

- 使用 `server/api-test.http` 可直接在 IDE（VS Code、Cursor）中逐段發送請求
- 或使用 curl：
```bash
curl -X POST http://localhost:8787/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"學習 Cloudflare Workers","description":"使用 Hono","completed":false}'
```

## D1 與 KV 設定

- wrangler 綁定（節錄 `wrangler.jsonc`）：
  - `assets.directory`: `./dist/client/`（對應 `npm run build-only` 的輸出）
  - `d1_databases[0].binding`: `DB`
  - `kv_namespaces[0].binding`: `KV`

### D1 Migrations（套用既有遷移檔）
```bash
# 本地
wrangler d1 migrations apply todo-database

# 遠端（生產）
wrangler d1 migrations apply todo-database --remote
```

### 查詢資料
```bash
wrangler d1 execute todo-database --command "SELECT * FROM todos;"
```

## 架構說明（MVC-ish）

- Routes：`server/routes/*` 只負責路由宣告
- Controllers：`server/controllers/*` 處理請求解析、商業邏輯、回應格式
- Repositories：`server/repositories/*` 純資料存取（D1、KV）
- Types/Model：`server/types.ts` 提供 `Env`、`Todo` 與回應型別

可再進一步加入：
- `services/`（跨資源交易流程）
- 請求驗證（如 zod）與統一錯誤處理

## 其他指令

```bash
# 僅建置（前端 + Workers SSR 產物）
npm run build-only

# 型別檢查
npm run type-check

# 產生 Cloudflare 型別（可選）
npm run cf-typegen
```

—
若你需要新增遷移檔，請依你慣用流程建立並放入 `migrations/`（本專案以 D1 為主，這裡不額外生成遷移檔範本）。
