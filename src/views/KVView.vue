<script setup lang="ts">
import { ref, computed } from 'vue'
import { kvSet, kvGet, kvDelete, kvList, type KvValueType } from '@/services/kvApi'

const key = ref('demo:text:hello')
const valueType = ref<KvValueType>('text')
const valueText = ref('world')
const valueJson = ref('{"id":1,"name":"George"}')
const ttl = ref<number | ''>('')
const metadataText = ref('{"note":"hello"}')

const output = ref('')

const listPrefix = ref('demo:')
const listLimit = ref<number | ''>(10)
const listCursor = ref('')
const listResult = ref<any>(null)

const bodyPreview = computed(() => {
  const body: any = { key: key.value, as: valueType.value }
  if (valueType.value === 'json') {
    try {
      body.value = JSON.parse(valueJson.value)
    } catch {
      body.value = valueJson.value
    }
  } else {
    body.value = valueText.value
  }
  if (ttl.value !== '' && Number(ttl.value) > 0) body.ttl = Number(ttl.value)
  try {
    body.metadata = JSON.parse(metadataText.value)
  } catch {
    // ignore parse error, let backend reject
  }
  return JSON.stringify(body, null, 2)
})

async function onSet() {
  try {
    const metadata = JSON.parse(metadataText.value)
    const body = {
      key: key.value,
      value: valueType.value === 'json' ? JSON.parse(valueJson.value) : valueText.value,
      as: valueType.value,
      ttl: ttl.value === '' ? undefined : Number(ttl.value),
      metadata,
    }
    const res = await kvSet(body)
    output.value = JSON.stringify(res, null, 2)
  } catch (e: any) {
    output.value = `Set error: ${e.message}`
  }
}

async function onGet() {
  try {
    const res = await kvGet(key.value, valueType.value)
    output.value = JSON.stringify(res, null, 2)
  } catch (e: any) {
    output.value = `Get error: ${e.message}`
  }
}

async function onDelete() {
  try {
    const res = await kvDelete(key.value)
    output.value = JSON.stringify(res, null, 2)
  } catch (e: any) {
    output.value = `Delete error: ${e.message}`
  }
}

async function onList(next?: boolean) {
  try {
    const res = await kvList({
      prefix: listPrefix.value || undefined,
      limit: listLimit.value === '' ? undefined : Number(listLimit.value),
      cursor: next ? listResult.value?.cursor : undefined,
    })
    listResult.value = res
    output.value = JSON.stringify(res, null, 2)
  } catch (e: any) {
    output.value = `List error: ${e.message}`
  }
}
</script>

<template>
  <section class="kv">
    <h2>KV 測試</h2>

    <div class="card">
      <h3>寫入 (Set)</h3>
      <div class="row">
        <label>Key</label>
        <input v-model="key" placeholder="key" />
      </div>
      <div class="row">
        <label>類型</label>
        <select v-model="valueType">
          <option value="text">text</option>
          <option value="json">json</option>
        </select>
      </div>
      <div class="row" v-if="valueType==='text'">
        <label>Value (text)</label>
        <input v-model="valueText" placeholder="value" />
      </div>
      <div class="row" v-else>
        <label>Value (json)</label>
        <textarea v-model="valueJson" rows="4" />
      </div>
      <div class="row">
        <label>TTL(秒)</label>
        <input v-model="ttl" type="number" min="1" placeholder="可留空" />
      </div>
      <div class="row">
        <label>Metadata(JSON)</label>
        <textarea v-model="metadataText" rows="3" />
      </div>
      <div class="row">
        <label>預覽</label>
        <pre class="preview">{{ bodyPreview }}</pre>
      </div>
      <div class="actions">
        <button class="green" @click="onSet">Set</button>
        <button @click="onGet">Get</button>
        <button class="danger" @click="onDelete">Delete</button>
      </div>
    </div>

    <div class="card">
      <h3>List / Prefix / 分頁</h3>
      <div class="row">
        <label>Prefix</label>
        <input v-model="listPrefix" placeholder="prefix" />
      </div>
      <div class="row">
        <label>Limit</label>
        <input v-model="listLimit" type="number" min="1" max="1000" />
      </div>
      <div class="actions">
        <button @click="onList(false)">List</button>
        <button :disabled="!listResult?.cursor" @click="onList(true)">下一頁</button>
      </div>
      <div class="row" v-if="listResult">
        <label>Cursor</label>
        <input :value="listResult.cursor || ''" readonly />
      </div>
    </div>

    <div class="card">
      <h3>輸出</h3>
      <pre class="output">{{ output }}</pre>
    </div>
  </section>
</template>

<style scoped>
.kv {
  display: grid;
  gap: 1rem;
  margin: 1rem 0;
}
.card {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1rem;
}
.row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 0.5rem;
  align-items: center;
  margin: 0.5rem 0;
}
label {
  color: var(--color-text);
}
input, select, textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-background-soft);
  color: var(--color-text);
}
.actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
button {
  background-color: hsla(160, 100%, 37%, 1);
  color: var(--color-background);
  border: 0;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
}
button.danger {
  background-color: #d64545;
}
.preview, .output {
  background: var(--color-background-soft);
  border: 1px dashed var(--color-border);
  border-radius: 6px;
  padding: 0.5rem;
  max-height: 300px;
  overflow: auto;
}
</style>


