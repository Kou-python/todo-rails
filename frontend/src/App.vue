<script setup>
import { ref, onMounted } from 'vue'

const todos = ref([])

onMounted(async () => {
  const res = await fetch('http://localhost:3000/todos', {
    mode: 'cors'
  })
  todos.value = await res.json()
})
</script>

<template>
  <h1>Todos</h1>
  <ul>
    <li v-for="todo in todos" :key="todo.id">{{ todo.title }}</li>
  </ul>
</template>
