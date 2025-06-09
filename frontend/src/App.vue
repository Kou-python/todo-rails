<script setup>
import { ref, onMounted } from "vue";

const todos = ref([]);
const newTitle = ref("");
const error = ref("");

const fetchTodos = async () => {
	try {
		const res = await fetch("/todos", { mode: "cors" });
		if (!res.ok) throw new Error("API error");
		todos.value = await res.json();
	} catch (e) {
		error.value = "TODOの取得に失敗しました";
	}
};

const addTodo = async () => {
	if (!newTitle.value.trim()) return;
	try {
		const res = await fetch("/todos/", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ todo: { title: newTitle.value, is_completed: false } }),
		});
		if (!res.ok) {
			const err = await res.json();
			throw new Error(err?.title || "API error");
		}
		newTitle.value = "";
		await fetchTodos();
	} catch (e) {
		error.value = "TODOの追加に失敗しました";
	}
};

const updateTodo = async (todo) => {
	try {
		const res = await fetch(`/todos/${todo.id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ todo: { ...todo, is_completed: !todo.is_completed } }),
		});
		if (!res.ok) {
			const err = await res.json();
			throw new Error(err?.title || "API error");
		}
		await fetchTodos();
	} catch (e) {
		error.value = "TODOの更新に失敗しました";
	}
};

const deleteTodo = async (id) => {
	try {
		const res = await fetch(`/todos/${id}`, {
			method: "DELETE",
		});
		if (!res.ok) throw new Error("API error");
		await fetchTodos();
	} catch (e) {
		error.value = "TODOの削除に失敗しました";
	}
};

onMounted(fetchTodos);
</script>

<template>
	<div class="app-container">
		<div class="header">
			<h1>TODOリスト</h1>
		</div>

		<div v-if="error" class="error-message">{{ error }}</div>

		<div class="add-todo-section">
			<form @submit.prevent="addTodo" class="add-form">
				<input v-model="newTitle" placeholder="新しいTODOを追加" class="todo-input" required />
				<button type="submit" class="add-button">追加</button>
			</form>
		</div>

		<div class="todos-section">
			<div v-if="todos.length === 0" class="empty-state">TODOがありません。新しいTODOを追加してください。</div>
			<div v-else class="todos-list">
				<div v-for="todo in todos" :key="todo.id" class="todo-item">
					<label class="todo-label">
						<input
							type="checkbox"
							:checked="todo.is_completed"
							@change="updateTodo(todo)"
							class="todo-checkbox"
						/>
						<span :class="{ completed: todo.is_completed }" class="todo-text">
							{{ todo.title }}
						</span>
					</label>
					<button @click="deleteTodo(todo.id)" class="delete-button">削除</button>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.app-container {
	/* max-width: 1200px; */
	margin: 0 auto;
	padding: 2rem;
	font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.header {
	text-align: center;
	margin-bottom: 2rem;
}

.header h1 {
	color: #2c3e50;
	font-size: 2.5rem;
	margin: 0;
	font-weight: 300;
}

.error-message {
	background-color: #fee;
	color: #c53030;
	padding: 1rem;
	border-radius: 8px;
	border-left: 4px solid #c53030;
	margin-bottom: 2rem;
	font-weight: 500;
}

.add-todo-section {
	background: #f8f9fa;
	padding: 2rem;
	border-radius: 12px;
	margin-bottom: 2rem;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.add-form {
	display: flex;
	gap: 1rem;
	align-items: stretch;
}

.todo-input {
	flex: 1;
	padding: 1rem;
	border: 2px solid #e2e8f0;
	border-radius: 8px;
	font-size: 1rem;
	transition: border-color 0.2s ease;
}

.todo-input:focus {
	outline: none;
	border-color: #3182ce;
	box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
}

.add-button {
	padding: 1rem 2rem;
	background: #3182ce;
	color: white;
	border: none;
	border-radius: 8px;
	font-size: 1rem;
	font-weight: 600;
	cursor: pointer;
	transition: background-color 0.2s ease, transform 0.1s ease;
}

.add-button:hover {
	background: #2c5282;
	transform: translateY(-1px);
}

.add-button:active {
	transform: translateY(0);
}

.todos-section {
	background: white;
	border-radius: 12px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	overflow: hidden;
}

.empty-state {
	padding: 3rem;
	text-align: center;
	color: #718096;
	font-size: 1.1rem;
}

.todos-list {
	padding: 0;
}

.todo-item {
	display: flex;
	align-items: center;
	padding: 1.5rem 2rem;
	border-bottom: 1px solid #e2e8f0;
	transition: background-color 0.2s ease;
}

.todo-item:last-child {
	border-bottom: none;
}

.todo-item:hover {
	background-color: #f7fafc;
}

.todo-label {
	display: flex;
	align-items: center;
	flex: 1;
	cursor: pointer;
	gap: 1rem;
}

.todo-checkbox {
	width: 20px;
	height: 20px;
	accent-color: #3182ce;
	cursor: pointer;
}

.todo-text {
	font-size: 1.1rem;
	line-height: 1.5;
	transition: all 0.2s ease;
}

.todo-text.completed {
	text-decoration: line-through;
	color: #718096;
	opacity: 0.7;
}

.delete-button {
	padding: 0.5rem 1rem;
	background: #e53e3e;
	color: white;
	border: none;
	border-radius: 6px;
	font-size: 0.9rem;
	cursor: pointer;
	transition: background-color 0.2s ease, transform 0.1s ease;
}

.delete-button:hover {
	background: #c53030;
	transform: translateY(-1px);
}

.delete-button:active {
	transform: translateY(0);
}
</style>
