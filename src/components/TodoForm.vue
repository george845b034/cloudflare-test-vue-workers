<script setup lang="ts">
import { ref } from 'vue';
import type { Todo } from '@/types/todo';

interface Emits {
  (e: 'submit', todo: Omit<Todo, 'id' | 'created_at' | 'updated_at'>): void;
}

const emit = defineEmits<Emits>();

const title = ref('');
const description = ref('');
const isSubmitting = ref(false);

const submitForm = async () => {
  if (!title.value.trim()) {
    alert('請輸入標題');
    return;
  }

  isSubmitting.value = true;
  
  try {
    const newTodo: Omit<Todo, 'id' | 'created_at' | 'updated_at'> = {
      title: title.value.trim(),
      description: description.value.trim() || undefined,
      completed: false,
    };

    emit('submit', newTodo);
    
    // 清空表單
    title.value = '';
    description.value = '';
  } catch (error) {
    console.error('Failed to submit todo:', error);
  } finally {
    isSubmitting.value = false;
  }
};

const resetForm = () => {
  title.value = '';
  description.value = '';
};
</script>

<template>
  <div class="todo-form">
    <h3>新增待辦事項</h3>
    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label for="title">標題 *</label>
        <input
          id="title"
          v-model="title"
          type="text"
          placeholder="輸入待辦事項標題"
          required
          :disabled="isSubmitting"
        />
      </div>
      
      <div class="form-group">
        <label for="description">描述</label>
        <textarea
          id="description"
          v-model="description"
          placeholder="輸入待辦事項描述（可選）"
          rows="3"
          :disabled="isSubmitting"
        ></textarea>
      </div>
      
      <div class="form-actions">
        <button
          type="submit"
          class="btn-primary"
          :disabled="isSubmitting || !title.trim()"
        >
          {{ isSubmitting ? '新增中...' : '新增待辦事項' }}
        </button>
        <button
          type="button"
          class="btn-secondary"
          @click="resetForm"
          :disabled="isSubmitting"
        >
          重設
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.todo-form {
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.todo-form h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.25rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #42b883;
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.1);
}

.form-group input:disabled,
.form-group textarea:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: #42b883;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #369870;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background-color: #a8d5c2;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #5a6268;
  transform: translateY(-1px);
}

.btn-secondary:disabled {
  background-color: #adb5bd;
  cursor: not-allowed;
  transform: none;
}
</style>
