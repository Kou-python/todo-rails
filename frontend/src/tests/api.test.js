import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import App from "../App.vue";

describe("App.vue - API操作テスト", () => {
	let wrapper;

	beforeEach(() => {
		global.fetch = vi.fn();
	});

	afterEach(() => {
		if (wrapper) {
			wrapper.unmount();
		}
		fetch.mockClear();
	});

	describe("TODO追加", () => {
		it("新しいTODOを正常に追加できる", async () => {
			// 初期fetch（空のリスト）
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => [],
			});

			// addTodo API
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ id: 1, title: "新しいTODO", is_completed: false }),
			});

			// 追加後のfetch
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => [{ id: 1, title: "新しいTODO", is_completed: false }],
			});

			wrapper = mount(App);
			await wrapper.vm.$nextTick();

			// 入力してフォーム送信
			const input = wrapper.find(".todo-input");
			await input.setValue("新しいTODO");

			const form = wrapper.find(".add-form");
			await form.trigger("submit.prevent");

			// API呼び出しを確認
			expect(fetch).toHaveBeenCalledWith("/todos/", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ todo: { title: "新しいTODO", is_completed: false } }),
			});
		});

		it("追加エラー時にエラーメッセージが表示される", async () => {
			// 初期fetch
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => [],
			});

			// addTodo API エラー
			fetch.mockResolvedValueOnce({
				ok: false,
				json: async () => ({ error: "バリデーションエラー" }),
			});

			wrapper = mount(App);
			await wrapper.vm.$nextTick();

			const input = wrapper.find(".todo-input");
			await input.setValue("新しいTODO");

			const form = wrapper.find(".add-form");
			await form.trigger("submit.prevent");

			// エラーを待機
			await new Promise((resolve) => setTimeout(resolve, 100));

			expect(wrapper.vm.error).toBe("TODOの追加に失敗しました");
		});
	});

	describe("TODO更新", () => {
		it("チェックボックスをクリックしてTODOを更新できる", async () => {
			// 初期fetch
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => [{ id: 1, title: "テストTODO", is_completed: false }],
			});

			wrapper = mount(App);
			await wrapper.vm.$nextTick();

			// データが設定されるまで待機
			await new Promise((resolve) => setTimeout(resolve, 100));

			// updateTodo API
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ id: 1, title: "テストTODO", is_completed: true }),
			});

			// 更新後のfetch
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => [{ id: 1, title: "テストTODO", is_completed: true }],
			});

			const checkbox = wrapper.find(".todo-checkbox");
			await checkbox.trigger("change");

			expect(fetch).toHaveBeenCalledWith("/todos/1", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ todo: { id: 1, title: "テストTODO", is_completed: true } }),
			});
		});

		it("更新エラー時にエラーメッセージが表示される", async () => {
			// 初期fetch
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => [{ id: 1, title: "テストTODO", is_completed: false }],
			});

			wrapper = mount(App);
			await wrapper.vm.$nextTick();
			await new Promise((resolve) => setTimeout(resolve, 100));

			// updateTodo API エラー
			fetch.mockResolvedValueOnce({
				ok: false,
				json: async () => ({ error: "更新エラー" }),
			});

			const checkbox = wrapper.find(".todo-checkbox");
			await checkbox.trigger("change");

			await new Promise((resolve) => setTimeout(resolve, 100));

			expect(wrapper.vm.error).toBe("TODOの更新に失敗しました");
		});
	});

	describe("TODO削除", () => {
		it("削除ボタンをクリックしてTODOを削除できる", async () => {
			// 初期fetch
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => [{ id: 1, title: "テストTODO", is_completed: false }],
			});

			wrapper = mount(App);
			await wrapper.vm.$nextTick();
			await new Promise((resolve) => setTimeout(resolve, 100));

			// deleteTodo API
			fetch.mockResolvedValueOnce({
				ok: true,
			});

			// 削除後のfetch
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => [],
			});

			const deleteButton = wrapper.find(".delete-button");
			await deleteButton.trigger("click");

			expect(fetch).toHaveBeenCalledWith("/todos/1", {
				method: "DELETE",
			});
		});

		it("削除エラー時にエラーメッセージが表示される", async () => {
			// 初期fetch
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => [{ id: 1, title: "テストTODO", is_completed: false }],
			});

			wrapper = mount(App);
			await wrapper.vm.$nextTick();
			await new Promise((resolve) => setTimeout(resolve, 100));

			// deleteTodo API エラー
			fetch.mockResolvedValueOnce({
				ok: false,
			});

			const deleteButton = wrapper.find(".delete-button");
			await deleteButton.trigger("click");

			await new Promise((resolve) => setTimeout(resolve, 100));

			expect(wrapper.vm.error).toBe("TODOの削除に失敗しました");
		});
	});

	describe("エラーハンドリング", () => {
		it("ネットワークエラー時にエラーメッセージが表示される", async () => {
			// 初期fetch でネットワークエラー
			fetch.mockRejectedValueOnce(new Error("Network Error"));

			wrapper = mount(App);
			await wrapper.vm.$nextTick();
			await new Promise((resolve) => setTimeout(resolve, 100));

			expect(wrapper.vm.error).toBe("TODOの取得に失敗しました");
		});

		it("空のタイトルでは追加されない", async () => {
			// 初期fetch
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => [],
			});

			wrapper = mount(App);
			await wrapper.vm.$nextTick();

			const form = wrapper.find(".add-form");
			await form.trigger("submit.prevent");

			// POST リクエストが送信されないことを確認
			expect(fetch).toHaveBeenCalledTimes(1); // 初期fetchのみ
		});
	});
});
