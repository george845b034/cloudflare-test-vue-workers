<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { Todo } from '@/types/todo';
import { TodoApi } from '@/services/todoApi';
import TodoForm from '@/components/TodoForm.vue';
import TodoItem from '@/components/TodoItem.vue';

const todos = ref<Todo[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// 載入 todos
const loadTodos = async () => {
  try {
    loading.value = true;
    error.value = null;
    todos.value = await TodoApi.getAllTodos();
  } catch (err) {
    error.value = err instanceof Error ? err.message : '載入失敗';
    console.error('Failed to load todos:', err);
  } finally {
    loading.value = false;
  }
};

// 新增 todo
const handleAddTodo = async (newTodo: Omit<Todo, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const createdTodo = await TodoApi.createTodo(newTodo);
    todos.value.unshift(createdTodo);
  } catch (err) {
    error.value = err instanceof Error ? err.message : '新增失敗';
    console.error('Failed to add todo:', err);
  }
};

// 更新 todo
const handleUpdateTodo = (updatedTodo: Todo) => {
  const index = todos.value.findIndex(todo => todo.id === updatedTodo.id);
  if (index !== -1) {
    todos.value[index] = updatedTodo;
  }
};

// 刪除 todo
const handleDeleteTodo = (id: number) => {
  todos.value = todos.value.filter(todo => todo.id !== id);
};

// 計算統計
const completedCount = computed(() => todos.value.filter(todo => todo.completed).length);
const totalCount = computed(() => todos.value.length);
const pendingCount = computed(() => totalCount.value - completedCount.value);

onMounted(() => {
  loadTodos();
});
</script>

<template>
  <div class="todo-page">
    <div class="todo-header">
      <h1>待辦事項管理</h1>
      <div class="todo-stats">
        <div class="stat-item">
          <span class="stat-number">{{ totalCount }}</span>
          <span class="stat-label">總計</span>
        </div>
        <div class="stat-item">
          <span class="stat-number pending">{{ pendingCount }}</span>
          <span class="stat-label">待完成</span>
        </div>
        <div class="stat-item">
          <span class="stat-number completed">{{ completedCount }}</span>
          <span class="stat-label">已完成</span>
        </div>
      </div>
    </div>

    <!-- 錯誤訊息 -->
    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="loadTodos" class="btn-retry">重試</button>
    </div>

    <!-- 載入中 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>載入中...</p>
    </div>

    <!-- 主要內容 -->
    <div v-else class="todo-content">
      <!-- 新增表單 -->
      <TodoForm @submit="handleAddTodo" />

      <!-- Todo 列表 -->
      <div class="todo-list">
        <div v-if="todos.length === 0" class="empty-state">
          <p>還沒有待辦事項</p>
          <p>點擊上方表單新增你的第一個待辦事項吧！</p>
        </div>
        
        <TodoItem
          v-for="todo in todos"
          :key="todo.id"
          :todo="todo"
          @update="handleUpdateTodo"
          @delete="handleDeleteTodo"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.todo-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.todo-header {
  text-align: center;
  margin-bottom: 2rem;
}

.todo-header h1 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 2.5rem;
  font-weight: 700;
}

.todo-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 80px;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #42b883;
}

.stat-number.pending {
  color: #f39c12;
}

.stat-number.completed {
  color: #27ae60;
}

.stat-label {
  font-size: 0.875rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

.error-message {
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  text-align: center;
}

.error-message p {
  margin: 0 0 1rem 0;
  color: #c33;
}

.btn-retry {
  background: #c33;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-retry:hover {
  background: #a22;
}

.loading {
  text-align: center;
  padding: 3rem 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #42b883;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.todo-content {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.todo-list {
  margin-top: 2rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  background: white;
  border: 2px dashed #e1e5e9;
  border-radius: 8px;
  color: #6c757d;
}

.empty-state p {
  margin: 0.5rem 0;
  font-size: 1.1rem;
}

.empty-state p:first-child {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
}

@media (max-width: 768px) {
  .todo-page {
    padding: 1rem 0.5rem;
  }
  
  .todo-header h1 {
    font-size: 2rem;
  }
  
  .todo-stats {
    gap: 1rem;
  }
  
  .stat-item {
    min-width: 60px;
    padding: 0.75rem;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
}
</style>
