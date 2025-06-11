import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import App from "../App.vue";

// fetchのモック
global.fetch = vi.fn();

describe("App.vue", () => {
	beforeEach(() => {
		// 各テスト前にfetchをリセット
		fetch.mockClear();
	});

	describe("初期表示", () => {
		it("正しくコンポーネントがマウントされる", async () => {
			// fetchTodosのモック
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => [],
			});

			const wrapper = mount(App);
			expect(wrapper.exists()).toBe(true);
			expect(wrapper.find("h1").text()).toBe("TODOリスト");
		});

		it("TODOが空の場合、空の状態メッセージが表示される", async () => {
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => [],
			});

			const wrapper = mount(App);

			// データが読み込まれるまで待機
			await wrapper.vm.$nextTick();
			await new Promise((resolve) => setTimeout(resolve, 0));

			expect(wrapper.find(".empty-state").text()).toBe("TODOがありません。新しいTODOを追加してください。");
		});

		it("TODOがある場合、リストが表示される", async () => {
			const mockTodos = [
				{ id: 1, title: "テストTODO1", is_completed: false },
				{ id: 2, title: "テストTODO2", is_completed: true },
			];

			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockTodos,
			});

			const wrapper = mount(App);

			// データが読み込まれるまで待機
			await wrapper.vm.$nextTick();
			await new Promise((resolve) => setTimeout(resolve, 0));

			expect(wrapper.findAll(".todo-item")).toHaveLength(2);
			expect(wrapper.find(".todo-text").text()).toBe("テストTODO1");
		});
	});

	describe("TODO追加機能", () => {
		it("新しいTODOを正常に追加できる", async () => {
			// 初期のfetchTodos
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => [],
			});

			// addTodoのfetch
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ id: 1, title: "新しいTODO", is_completed: false }),
			});

			// 追加後のfetchTodos
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => [{ id: 1, title: "新しいTODO", is_completed: false }],
			});

			const wrapper = mount(App);
			await wrapper.vm.$nextTick();

			// 入力フィールドに値を設定
			const input = wrapper.find(".todo-input");
			await input.setValue("新しいTODO");

			// フォームを送信
			const form = wrapper.find(".add-form");
			await form.trigger("submit.prevent");

			// API呼び出しが正しく行われたかチェック
			expect(fetch).toHaveBeenCalledWith("/todos/", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ todo: { title: "新しいTODO", is_completed: false } }),
			});
		});

		it("空のタイトルでは追加されない", async () => {
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => [],
			});

			const wrapper = mount(App);
			await wrapper.vm.$nextTick();

			// 空の入力でフォームを送信
			const form = wrapper.find(".add-form");
			await form.trigger("submit.prevent");

			// POST リクエストが送信されないことを確認
			expect(fetch).toHaveBeenCalledTimes(1); // 初期のfetchTodosのみ
		});

		it("追加エラー時にエラーメッセージが表示される", async () => {
			// 初期のfetchTodos
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => [],
			});

			// addTodoでエラー
			fetch.mockResolvedValueOnce({
				ok: false,
				json: async () => ({ title: "エラーメッセージ" }),
			});

			const wrapper = mount(App);
			await wrapper.vm.$nextTick();

			const input = wrapper.find(".todo-input");
			await input.setValue("新しいTODO");

			const form = wrapper.find(".add-form");
			await form.trigger("submit.prevent");

			await wrapper.vm.$nextTick();
			await new Promise((resolve) => setTimeout(resolve, 0));

			expect(wrapper.find(".error-message").text()).toBe("TODOの追加に失敗しました");
		});
	});

	describe("TODO更新機能", () => {
		it("チェックボックスクリックでTODOの完了状態を更新できる", async () => {
			const mockTodos = [{ id: 1, title: "テストTODO", is_completed: false }];

			// 初期のfetchTodos
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockTodos,
			});

			// updateTodoのfetch
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ id: 1, title: "テストTODO", is_completed: true }),
			});

			// 更新後のfetchTodos
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => [{ id: 1, title: "テストTODO", is_completed: true }],
			});

			const wrapper = mount(App);
			await wrapper.vm.$nextTick();
			await new Promise((resolve) => setTimeout(resolve, 0));

			// チェックボックスをクリック
			const checkbox = wrapper.find(".todo-checkbox");
			await checkbox.trigger("change");

			// API呼び出しが正しく行われたかチェック
			expect(fetch).toHaveBeenCalledWith("/todos/1", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ todo: { id: 1, title: "テストTODO", is_completed: true } }),
			});
		});

		it("更新エラー時にエラーメッセージが表示される", async () => {
			const mockTodos = [{ id: 1, title: "テストTODO", is_completed: false }];

			// 初期のfetchTodos
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockTodos,
			});

			// updateTodoでエラー
			fetch.mockResolvedValueOnce({
				ok: false,
				json: async () => ({ title: "エラーメッセージ" }),
			});

			const wrapper = mount(App);
			await wrapper.vm.$nextTick();
			await new Promise((resolve) => setTimeout(resolve, 0));

			const checkbox = wrapper.find(".todo-checkbox");
			await checkbox.trigger("change");

			await wrapper.vm.$nextTick();
			await new Promise((resolve) => setTimeout(resolve, 0));

			expect(wrapper.find(".error-message").text()).toBe("TODOの更新に失敗しました");
		});
	});

	describe("TODO削除機能", () => {
		it("削除ボタンクリックでTODOを削除できる", async () => {
			const mockTodos = [{ id: 1, title: "テストTODO", is_completed: false }];

			// 初期のfetchTodos
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockTodos,
			});

			// deleteTodoのfetch
			fetch.mockResolvedValueOnce({
				ok: true,
			});

			// 削除後のfetchTodos
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => [],
			});

			const wrapper = mount(App);
			await wrapper.vm.$nextTick();
			await new Promise((resolve) => setTimeout(resolve, 0));

			// 削除ボタンをクリック
			const deleteButton = wrapper.find(".delete-button");
			await deleteButton.trigger("click");

			// API呼び出しが正しく行われたかチェック
			expect(fetch).toHaveBeenCalledWith("/todos/1", {
				method: "DELETE",
			});
		});

		it("削除エラー時にエラーメッセージが表示される", async () => {
			const mockTodos = [{ id: 1, title: "テストTODO", is_completed: false }];

			// 初期のfetchTodos
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockTodos,
			});

			// deleteTodoでエラー
			fetch.mockResolvedValueOnce({
				ok: false,
			});

			const wrapper = mount(App);
			await wrapper.vm.$nextTick();
			await new Promise((resolve) => setTimeout(resolve, 0));

			const deleteButton = wrapper.find(".delete-button");
			await deleteButton.trigger("click");

			await wrapper.vm.$nextTick();
			await new Promise((resolve) => setTimeout(resolve, 0));

			expect(wrapper.find(".error-message").text()).toBe("TODOの削除に失敗しました");
		});
	});

	describe("スタイリング", () => {
		it("完了済みTODOに正しいCSSクラスが適用される", async () => {
			const mockTodos = [
				{ id: 1, title: "完了済みTODO", is_completed: true },
				{ id: 2, title: "未完了TODO", is_completed: false },
			];

			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockTodos,
			});

			const wrapper = mount(App);
			await wrapper.vm.$nextTick();
			await new Promise((resolve) => setTimeout(resolve, 0));

			const todoTexts = wrapper.findAll(".todo-text");
			expect(todoTexts[0].classes()).toContain("completed");
			expect(todoTexts[1].classes()).not.toContain("completed");
		});

		it("チェックボックスの状態が正しく反映される", async () => {
			const mockTodos = [
				{ id: 1, title: "完了済みTODO", is_completed: true },
				{ id: 2, title: "未完了TODO", is_completed: false },
			];

			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockTodos,
			});

			const wrapper = mount(App);
			await wrapper.vm.$nextTick();
			await new Promise((resolve) => setTimeout(resolve, 0));

			const checkboxes = wrapper.findAll(".todo-checkbox");
			expect(checkboxes[0].element.checked).toBe(true);
			expect(checkboxes[1].element.checked).toBe(false);
		});
	});

	describe("エラーハンドリング", () => {
		it("初期データ取得エラー時にエラーメッセージが表示される", async () => {
			fetch.mockRejectedValueOnce(new Error("Network error"));

			const wrapper = mount(App);
			await wrapper.vm.$nextTick();
			await new Promise((resolve) => setTimeout(resolve, 0));

			expect(wrapper.find(".error-message").text()).toBe("TODOの取得に失敗しました");
		});
	});
});
