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
			expect(wrapper.vm.todos).toEqual([]);
		});

		it("newTitleの初期値が空文字である", async () => {
			wrapper = mount(App);
			expect(wrapper.vm.newTitle).toBe("");
		});

		it("errorの初期値が空文字である", async () => {
			wrapper = mount(App);
			expect(wrapper.vm.error).toBe("");
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
			expect(wrapper.vm.newTitle).toBe("テスト入力");

			// プログラムで値を変更
			wrapper.vm.newTitle = "プログラム変更";
			await wrapper.vm.$nextTick();
			expect(input.element.value).toBe("プログラム変更");
		});

		it("フォーム送信時にaddTodoが呼ばれる", async () => {
			const addTodoSpy = vi.spyOn(wrapper.vm, "addTodo");
			
			// submit ボタンを直接クリック
			const submitButton = wrapper.find(".add-button");
			await submitButton.trigger("click");
			
			expect(addTodoSpy).toHaveBeenCalled();
		});

		it("空文字の場合はrequired属性により送信が阻止される", async () => {
			const input = wrapper.find(".todo-input");
			expect(input.attributes("required")).toBeDefined();
		});
	});

	describe("条件付きレンダリング", () => {
		it("エラーがある場合のみエラーメッセージが表示される", async () => {
			wrapper = mount(App);

			// 初期状態ではエラーメッセージなし
			expect(wrapper.find(".error-message").exists()).toBe(false);

			// エラーを設定
			wrapper.vm.error = "テストエラー";
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".error-message").exists()).toBe(true);
			expect(wrapper.find(".error-message").text()).toBe("テストエラー");
		});

		it("todosが空の場合は空状態メッセージが表示される", async () => {
			wrapper = mount(App);
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".empty-state").exists()).toBe(true);
			expect(wrapper.find(".todos-list").exists()).toBe(false);
		});

		it("todosがある場合はリストが表示される", async () => {
			wrapper = mount(App);

			// TODOを追加
			wrapper.vm.todos = [{ id: 1, title: "テストTODO", is_completed: false }];
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".empty-state").exists()).toBe(false);
			expect(wrapper.find(".todos-list").exists()).toBe(true);
		});
	});

	describe("リストレンダリング", () => {
		beforeEach(async () => {
			wrapper = mount(App);
			// TODOデータを直接設定
			wrapper.vm.todos.push(
				{ id: 1, title: "TODO1", is_completed: false },
				{ id: 2, title: "TODO2", is_completed: true },
				{ id: 3, title: "TODO3", is_completed: false }
			);
			await wrapper.vm.$nextTick();
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
			wrapper = mount(App);
			wrapper.vm.todos.push({ id: 1, title: "テストTODO", is_completed: false });
			await wrapper.vm.$nextTick();
		});

		it("チェックボックス変更でupdateTodoが呼ばれる", async () => {
			const updateTodoSpy = vi.spyOn(wrapper.vm, "updateTodo");

			const checkbox = wrapper.find(".todo-checkbox");
			await checkbox.trigger("change");

			expect(updateTodoSpy).toHaveBeenCalledWith({ id: 1, title: "テストTODO", is_completed: false });
		});

		it("削除ボタンクリックでdeleteTodoが呼ばれる", async () => {
			const deleteTodoSpy = vi.spyOn(wrapper.vm, "deleteTodo");

			const deleteButton = wrapper.find(".delete-button");
			await deleteButton.trigger("click");

			expect(deleteTodoSpy).toHaveBeenCalledWith(1);
		});
	});

	describe("CSS クラスの動的適用", () => {
		beforeEach(async () => {
			wrapper = mount(App);
			wrapper.vm.todos.push(
				{ id: 1, title: "未完了TODO", is_completed: false },
				{ id: 2, title: "完了済みTODO", is_completed: true }
			);
			await wrapper.vm.$nextTick();
		});

		it("is_completedの値に基づいてcompletedクラスが適用される", () => {
			const todoTexts = wrapper.findAll(".todo-text");

			// 未完了TODO
			expect(todoTexts[0].classes()).not.toContain("completed");

			// 完了済みTODO
			expect(todoTexts[1].classes()).toContain("completed");
		});

		it("is_completedが変更されるとクラスも更新される", async () => {
			const todoText = wrapper.findAll(".todo-text")[0];

			// 初期状態（未完了）
			expect(todoText.classes()).not.toContain("completed");

			// 完了状態に変更
			wrapper.vm.todos[0].is_completed = true;
			await wrapper.vm.$nextTick();

			expect(todoText.classes()).toContain("completed");
		});
	});

	describe("フォームリセット", () => {
		it("TODO追加時に入力フィールドがクリアされる想定", async () => {
			// これは実際のaddTodo関数の動作をテストする場合に使用
			wrapper = mount(App);

			// モックを設定して成功レスポンスを返す
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ id: 1, title: "テスト", is_completed: false }),
			});
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => [{ id: 1, title: "テスト", is_completed: false }],
			});

			// 入力値を設定
			wrapper.vm.newTitle = "テストTODO";
			await wrapper.vm.$nextTick();

			// addTodoを実行
			await wrapper.vm.addTodo();

			// 入力フィールドがクリアされることを確認
			expect(wrapper.vm.newTitle).toBe("");
		});
	});
});
