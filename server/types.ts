// 環境變數類型
export interface Env {
	DB: D1Database;
	ASSETS: Fetcher;
    KV: KVNamespace;
}

// Todo 類型
export interface Todo {
	id?: number;
	title: string;
	description?: string;
	completed: boolean;
	created_at?: string;
	updated_at?: string;
}

// API 回應類型
export interface ApiResponse<T = any> {
	data?: T;
	error?: string;
	message?: string;
}

// Todo 列表回應
export interface TodosResponse extends ApiResponse {
	todos?: Todo[];
}

// 單一 Todo 回應
export interface TodoResponse extends ApiResponse {
	todo?: Todo;
}
