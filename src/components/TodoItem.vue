<script setup lang="ts">
import type { Todo } from '@/types/todo';
import { TodoApi } from '@/services/todoApi';

interface Props {
  todo: Todo;
}

interface Emits {
  (e: 'update', todo: Todo): void;
  (e: 'delete', id: number): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const toggleCompleted = async () => {
  try {
    if (props.todo.id) {
      const updatedTodo = await TodoApi.toggleTodo(props.todo.id);
      emit('update', updatedTodo);
    }
  } catch (error) {
    console.error('Failed to toggle todo:', error);
  }
};

const deleteTodo = async () => {
  try {
    if (props.todo.id) {
      await TodoApi.deleteTodo(props.todo.id);
      emit('delete', props.todo.id);
    }
  } catch (error) {
    console.error('Failed to delete todo:', error);
  }
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('zh-TW');
};
</script>

<template>
  <div class="todo-item" :class="{ completed: todo.completed }">
    <div class="todo-content">
      <div class="todo-header">
        <label class="checkbox-container">
          <input
            type="checkbox"
            :checked="todo.completed"
            @change="toggleCompleted"
          />
          <span class="checkmark"></span>
        </label>
        <h3 class="todo-title">{{ todo.title }}</h3>
        <button class="delete-btn" @click="deleteTodo" title="刪除">
          🗑️
        </button>
      </div>
      
      <p v-if="todo.description" class="todo-description">
        {{ todo.description }}
      </p>
      
      <div class="todo-meta">
        <span class="todo-date">
          建立於: {{ formatDate(todo.created_at) }}
        </span>
        <span v-if="todo.updated_at && todo.updated_at !== todo.created_at" class="todo-date">
          更新於: {{ formatDate(todo.updated_at) }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.todo-item {
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.todo-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.todo-item.completed {
  opacity: 0.7;
  background: #f8f9fa;
}

.todo-item.completed .todo-title {
  text-decoration: line-through;
  color: #6c757d;
}

.todo-content {
  width: 100%;
}

.todo-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.todo-title {
  margin: 0;
  flex: 1;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
}

.todo-description {
  margin: 0.5rem 0;
  color: #6c757d;
  line-height: 1.5;
}

.todo-meta {
  display: flex;
  gap: 1rem;
  margin-top: 0.75rem;
  font-size: 0.8rem;
  color: #868e96;
}

.todo-date {
  font-style: italic;
}

.delete-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.delete-btn:hover {
  background-color: #f8f9fa;
}

/* Checkbox 樣式 */
.checkbox-container {
  display: inline-block;
  position: relative;
  cursor: pointer;
  user-select: none;
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  height: 20px;
  width: 20px;
  background-color: #eee;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.checkbox-container:hover input ~ .checkmark {
  background-color: #ccc;
}

.checkbox-container input:checked ~ .checkmark {
  background-color: #42b883;
}

.checkmark:after {
  content: "";
  display: none;
  color: white;
  font-weight: bold;
}

.checkbox-container input:checked ~ .checkmark:after {
  display: block;
  content: "✓";
}
</style>
