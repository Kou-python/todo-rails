import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import App from "../App.vue";

describe("App.vue ユニットテスト", () => {
	let wrapper;

	beforeEach(() => {
		// fetchのモック
		global.fetch = vi.fn();
		fetch.mockResolvedValue({
			ok: true,
			json: async () => [],
		});
	});

	afterEach(() => {
		if (wrapper) {
			wrapper.unmount();
		}
		fetch.mockClear();
	});

	describe("リアクティブデータ", () => {
		it("todosの初期値が空配列である", async () => {
			wrapper = mount(App);
			await wrapper.vm.$nextTick();
			await new Promise((resolve) => setTimeout(resolve, 0));

			// 初期状態で空の状態メッセージが表示されることで確認
			expect(wrapper.find(".empty-state").exists()).toBe(true);
		});

		it("newTitleの初期値が空文字である", async () => {
			wrapper = mount(App);
			const input = wrapper.find(".todo-input");
			expect(input.element.value).toBe("");
		});

		it("errorの初期値が空文字である", async () => {
			wrapper = mount(App);
			// エラーメッセージが表示されていないことで確認
			expect(wrapper.find(".error-message").exists()).toBe(false);
		});
	});

	describe("フォーム入力", () => {
		beforeEach(async () => {
			wrapper = mount(App);
			await wrapper.vm.$nextTick();
		});

		it("入力フィールドとnewTitleが双方向バインディングされている", async () => {
			const input = wrapper.find(".todo-input");

			// 入力値を変更
			await input.setValue("テスト入力");
			expect(input.element.value).toBe("テスト入力");
		});

		it("フォーム送信時にfetchが呼ばれる", async () => {
			// POST用のモックを設定
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ id: 1, title: "テスト", is_completed: false }),
			});
			// fetchTodos用のモックを設定
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => [{ id: 1, title: "テスト", is_completed: false }],
			});

			const input = wrapper.find(".todo-input");
			await input.setValue("テスト入力");

			const form = wrapper.find(".add-form");
			await form.trigger("submit");

			// POST requestが呼ばれることを確認
			expect(fetch).toHaveBeenCalledWith("/todos/", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ todo: { title: "テスト入力", is_completed: false } }),
			});
		});

		it("空文字の場合はrequired属性により送信が阻止される", async () => {
			const input = wrapper.find(".todo-input");
			expect(input.attributes("required")).toBeDefined();
		});
	});

	describe("条件付きレンダリング", () => {
		it("エラーがある場合のみエラーメッセージが表示される", async () => {
			// エラーを発生させるモック
			fetch.mockRejectedValue(new Error("API error"));

			wrapper = mount(App);
			await wrapper.vm.$nextTick();
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(wrapper.find(".error-message").exists()).toBe(true);
			expect(wrapper.find(".error-message").text()).toBe("TODOの取得に失敗しました");
		});

		it("todosが空の場合は空状態メッセージが表示される", async () => {
			wrapper = mount(App);
			await wrapper.vm.$nextTick();
			await new Promise((resolve) => setTimeout(resolve, 0));

			expect(wrapper.find(".empty-state").exists()).toBe(true);
			expect(wrapper.find(".todos-list").exists()).toBe(false);
		});

		it("todosがある場合はリストが表示される", async () => {
			const mockTodos = [{ id: 1, title: "テストTODO", is_completed: false }];
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockTodos,
			});

			wrapper = mount(App);
			await wrapper.vm.$nextTick();
			await new Promise((resolve) => setTimeout(resolve, 0));

			expect(wrapper.find(".empty-state").exists()).toBe(false);
			expect(wrapper.find(".todos-list").exists()).toBe(true);
		});
	});

	describe("リストレンダリング", () => {
		beforeEach(async () => {
			const mockTodos = [
				{ id: 1, title: "TODO1", is_completed: false },
				{ id: 2, title: "TODO2", is_completed: true },
				{ id: 3, title: "TODO3", is_completed: false },
			];
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockTodos,
			});

			wrapper = mount(App);
			await wrapper.vm.$nextTick();
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		it("正しい数のTODOアイテムがレンダリングされる", () => {
			expect(wrapper.findAll(".todo-item")).toHaveLength(3);
		});

		it("各TODOのタイトルが正しく表示される", () => {
			const todoTexts = wrapper.findAll(".todo-text");
			expect(todoTexts[0].text()).toBe("TODO1");
			expect(todoTexts[1].text()).toBe("TODO2");
			expect(todoTexts[2].text()).toBe("TODO3");
		});

		it("各TODOのチェック状態が正しく反映される", () => {
			const checkboxes = wrapper.findAll(".todo-checkbox");
			expect(checkboxes[0].element.checked).toBe(false);
			expect(checkboxes[1].element.checked).toBe(true);
			expect(checkboxes[2].element.checked).toBe(false);
		});

		it("完了済みTODOに正しいクラスが適用される", () => {
			const todoTexts = wrapper.findAll(".todo-text");
			expect(todoTexts[0].classes()).not.toContain("completed");
			expect(todoTexts[1].classes()).toContain("completed");
			expect(todoTexts[2].classes()).not.toContain("completed");
		});

		it("各TODOに削除ボタンが存在する", () => {
			expect(wrapper.findAll(".delete-button")).toHaveLength(3);
		});
	});

	describe("イベントハンドリング", () => {
		beforeEach(async () => {
			const mockTodos = [{ id: 1, title: "テストTODO", is_completed: false }];
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockTodos,
			});

			wrapper = mount(App);
			await wrapper.vm.$nextTick();
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		it("チェックボックス変更でPATCHリクエストが呼ばれる", async () => {
			// PATCH用のモックを設定
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ id: 1, title: "テストTODO", is_completed: true }),
			});
			// fetchTodos用のモックを設定
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

		it("削除ボタンクリックでDELETEリクエストが呼ばれる", async () => {
			// DELETE用のモックを設定
			fetch.mockResolvedValueOnce({
				ok: true,
			});
			// fetchTodos用のモックを設定
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
	});

	describe("CSS クラスの動的適用", () => {
		beforeEach(async () => {
			const mockTodos = [
				{ id: 1, title: "未完了TODO", is_completed: false },
				{ id: 2, title: "完了済みTODO", is_completed: true },
			];
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockTodos,
			});

			wrapper = mount(App);
			await wrapper.vm.$nextTick();
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		it("is_completedの値に基づいてcompletedクラスが適用される", () => {
			const todoTexts = wrapper.findAll(".todo-text");

			// 未完了TODO
			expect(todoTexts[0].classes()).not.toContain("completed");

			// 完了済みTODO
			expect(todoTexts[1].classes()).toContain("completed");
		});

		it("チェックボックス操作により完了状態が変更される", async () => {
			// PATCH用のモックを設定
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ id: 1, title: "未完了TODO", is_completed: true }),
			});
			// fetchTodos用のモックを設定（更新後の状態）
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => [
					{ id: 1, title: "未完了TODO", is_completed: true },
					{ id: 2, title: "完了済みTODO", is_completed: true },
				],
			});

			const checkbox = wrapper.findAll(".todo-checkbox")[0];
			await checkbox.trigger("change");
			await wrapper.vm.$nextTick();
			await new Promise((resolve) => setTimeout(resolve, 10));

			// 状態が更新されることを確認（APIが呼ばれることで間接的に確認）
			expect(fetch).toHaveBeenCalledWith("/todos/1", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ todo: { id: 1, title: "未完了TODO", is_completed: true } }),
			});
		});
	});

	describe("フォームリセット", () => {
		it("TODO追加時に入力フィールドがクリアされる", async () => {
			wrapper = mount(App);

			// POST用のモックを設定
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ id: 1, title: "テスト", is_completed: false }),
			});
			// fetchTodos用のモックを設定
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => [{ id: 1, title: "テスト", is_completed: false }],
			});

			const input = wrapper.find(".todo-input");
			await input.setValue("テストTODO");

			const form = wrapper.find(".add-form");
			await form.trigger("submit");
			await wrapper.vm.$nextTick();
			await new Promise((resolve) => setTimeout(resolve, 10));

			// 入力フィールドがクリアされることを確認
			expect(input.element.value).toBe("");
		});
	});
});
