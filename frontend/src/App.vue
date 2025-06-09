<template>
<!-- html -->
  <div>
    <ul>
      <li v-for="todo in todos" :key="todo.id">{{ todo.title }}</li>
    </ul>
  </div>
</template>

<script>
// js
import axios from 'axios'

export default {
  data() {
    return {
      todos: []
    }
  },
  mounted() {
    axios.get('http://localhost:3000/todos')
      .then(response => {
        this.todos = response.data
      })
  }
}
</script>
