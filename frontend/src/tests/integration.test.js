import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import App from "../App.vue";

// APIレスポンスのモックヘルパー
export const createMockResponse = (data, ok = true) => ({
	ok,
	json: async () => data,
});

// エラーレスポンスのモックヘルパー
export const createErrorResponse = (errorData, ok = false) => ({
	ok,
	json: async () => errorData,
});

// fetchのモックセットアップヘルパー
export const setupFetchMock = (...responses) => {
	global.fetch = vi.fn();
	responses.forEach((response, index) => {
		if (index === 0) {
			fetch.mockResolvedValueOnce(response);
		} else {
			fetch.mockResolvedValueOnce(response);
		}
	});
};

describe("API統合テスト", () => {
	beforeEach(() => {
		// fetchのモックをセットアップ
		global.fetch = vi.fn();
	});

	afterEach(() => {
		if (global.fetch && typeof global.fetch.mockClear === "function") {
			global.fetch.mockClear();
		}
	});

	describe("API呼び出しシーケンス", () => {
		it("完全なTODO追加フローが正しく動作する", async () => {
			const initialTodos = [];
			const newTodo = { id: 1, title: "新しいTODO", is_completed: false };
			const updatedTodos = [newTodo];

			setupFetchMock(
				createMockResponse(initialTodos), // 初期fetchTodos
				createMockResponse(newTodo), // addTodo
				createMockResponse(updatedTodos) // 追加後のfetchTodos
			);

			const wrapper = mount(App);
			await wrapper.vm.$nextTick();

			// 初期状態の確認
			expect(wrapper.find(".empty-state").exists()).toBe(true);

			// TODO追加
			await wrapper.find(".todo-input").setValue("新しいTODO");
			await wrapper.find(".add-form").trigger("submit.prevent");
			await wrapper.vm.$nextTick();
			await new Promise((resolve) => setTimeout(resolve, 0));

			// API呼び出しの確認
			expect(fetch).toHaveBeenCalledTimes(3);
			expect(fetch).toHaveBeenNthCalledWith(1, "/todos", { mode: "cors" });
			expect(fetch).toHaveBeenNthCalledWith(2, "/todos/", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ todo: { title: "新しいTODO", is_completed: false } }),
			});
			expect(fetch).toHaveBeenNthCalledWith(3, "/todos", { mode: "cors" });
		});

		it("TODO更新フローが正しく動作する", async () => {
			const initialTodos = [{ id: 1, title: "テストTODO", is_completed: false }];
			const updatedTodo = { id: 1, title: "テストTODO", is_completed: true };
			const updatedTodos = [updatedTodo];

			setupFetchMock(
				createMockResponse(initialTodos), // 初期fetchTodos
				createMockResponse(updatedTodo), // updateTodo
				createMockResponse(updatedTodos) // 更新後のfetchTodos
			);

			const wrapper = mount(App);
			await wrapper.vm.$nextTick();
			await new Promise((resolve) => setTimeout(resolve, 0));

			// チェックボックスをクリック
			await wrapper.find(".todo-checkbox").trigger("change");
			await wrapper.vm.$nextTick();

			// API呼び出しの確認
			expect(fetch).toHaveBeenCalledTimes(3);
			expect(fetch).toHaveBeenNthCalledWith(2, "/todos/1", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ todo: { id: 1, title: "テストTODO", is_completed: true } }),
			});
		});

		it("TODO削除フローが正しく動作する", async () => {
			const initialTodos = [{ id: 1, title: "テストTODO", is_completed: false }];
			const emptyTodos = [];

			setupFetchMock(
				createMockResponse(initialTodos), // 初期fetchTodos
				createMockResponse({}), // deleteTodo
				createMockResponse(emptyTodos) // 削除後のfetchTodos
			);

			const wrapper = mount(App);
			await wrapper.vm.$nextTick();
			await new Promise((resolve) => setTimeout(resolve, 0));

			// 削除ボタンをクリック
			await wrapper.find(".delete-button").trigger("click");
			await wrapper.vm.$nextTick();

			// API呼び出しの確認
			expect(fetch).toHaveBeenCalledTimes(3);
			expect(fetch).toHaveBeenNthCalledWith(2, "/todos/1", {
				method: "DELETE",
			});
		});
	});

	describe("エラーハンドリング統合テスト", () => {
		it("連続したAPI エラーが正しく処理される", async () => {
			// 初期取得は成功、その後の操作でエラー
			setupFetchMock(
				createMockResponse([{ id: 1, title: "テストTODO", is_completed: false }]),
				createErrorResponse({ title: "更新エラー" })
			);

			const wrapper = mount(App);
			await wrapper.vm.$nextTick();
			await new Promise((resolve) => setTimeout(resolve, 0));

			// 更新でエラー
			await wrapper.find(".todo-checkbox").trigger("change");
			await wrapper.vm.$nextTick();
			await new Promise((resolve) => setTimeout(resolve, 0));

			expect(wrapper.find(".error-message").text()).toBe("TODOの更新に失敗しました");

			// 次の操作で成功する場合のテスト
			fetch.mockResolvedValueOnce(createMockResponse({}));
			fetch.mockResolvedValueOnce(createMockResponse([]));

			await wrapper.find(".delete-button").trigger("click");
			await wrapper.vm.$nextTick();
			await new Promise((resolve) => setTimeout(resolve, 0));

			// エラーメッセージがクリアされないことを確認（新しいエラーがない場合）
			expect(wrapper.find(".error-message").exists()).toBe(true);
		});
	});

	describe("データ整合性テスト", () => {
		it("同時操作での整合性が保たれる", async () => {
			const initialTodos = [
				{ id: 1, title: "TODO1", is_completed: false },
				{ id: 2, title: "TODO2", is_completed: false },
			];

			setupFetchMock(
				createMockResponse(initialTodos),
				createMockResponse({}), // 削除
				createMockResponse([{ id: 2, title: "TODO2", is_completed: false }]), // 削除後
				createMockResponse({ id: 2, title: "TODO2", is_completed: true }), // 更新
				createMockResponse([{ id: 2, title: "TODO2", is_completed: true }]) // 更新後
			);

			const wrapper = mount(App);
			await wrapper.vm.$nextTick();
			await new Promise((resolve) => setTimeout(resolve, 0));

			// 最初のTODOを削除
			const deleteButtons = wrapper.findAll(".delete-button");
			await deleteButtons[0].trigger("click");
			await wrapper.vm.$nextTick();
			await new Promise((resolve) => setTimeout(resolve, 0));

			// 残りのTODOを更新
			await wrapper.find(".todo-checkbox").trigger("change");
			await wrapper.vm.$nextTick();

			// 正しい順序でAPI が呼び出されることを確認
			expect(fetch).toHaveBeenCalledTimes(5);
		});
	});
});
