import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import App from "../App.vue";
import {
	mockTodos,
	setupSuccessfulFetch,
	setupSequentialFetch,
	setupFailedFetch,
	createSuccessResponse,
	createErrorResponse,
	waitForNextTick,
	addTodo,
	toggleTodo,
	deleteTodo,
	expectTodoCount,
	expectEmptyState,
	expectTodosVisible,
	expectErrorMessage,
	expectNoErrorMessage,
	expectFetchCalledWith,
	expectFetchCallCount,
} from "./setup.js";

describe("App.vue E2E テスト", () => {
	let wrapper;

	afterEach(() => {
		if (wrapper) {
			wrapper.unmount();
		}
	});

	describe("完全なTODOライフサイクル", () => {
		it("新しいTODOを追加し、完了にし、削除する完全なフロー", async () => {
			setupSequentialFetch(
				createSuccessResponse(mockTodos.empty), // 初期取得
				createSuccessResponse({ id: 1, title: "新しいTODO", is_completed: false }), // 追加
				createSuccessResponse([{ id: 1, title: "新しいTODO", is_completed: false }]), // 追加後取得
				createSuccessResponse({ id: 1, title: "新しいTODO", is_completed: true }), // 完了
				createSuccessResponse([{ id: 1, title: "新しいTODO", is_completed: true }]), // 完了後取得
				createSuccessResponse({}), // 削除
				createSuccessResponse(mockTodos.empty) // 削除後取得
			);

			wrapper = mount(App);
			await waitForNextTick(wrapper);

			// 1. 初期状態：空のリスト
			expectEmptyState(wrapper);
			expectNoErrorMessage(wrapper);

			// 2. TODO追加
			await addTodo(wrapper, "新しいTODO");
			expectTodosVisible(wrapper);
			expectTodoCount(wrapper, 1);
			expect(wrapper.find(".todo-text").text()).toBe("新しいTODO");
			expect(wrapper.find(".todo-checkbox").element.checked).toBe(false);

			// 3. TODO完了
			await toggleTodo(wrapper, 0);
			expect(wrapper.find(".todo-checkbox").element.checked).toBe(true);
			expect(wrapper.find(".todo-text").classes()).toContain("completed");

			// 4. TODO削除
			await deleteTodo(wrapper, 0);
			expectEmptyState(wrapper);

			// API呼び出しの確認
			expectFetchCallCount(7);
		});

		it("複数のTODOを管理する", async () => {
			setupSequentialFetch(
				createSuccessResponse(mockTodos.empty),
				createSuccessResponse({ id: 1, title: "TODO1", is_completed: false }),
				createSuccessResponse([{ id: 1, title: "TODO1", is_completed: false }]),
				createSuccessResponse({ id: 2, title: "TODO2", is_completed: false }),
				createSuccessResponse(mockTodos.multiple.slice(0, 2))
			);

			wrapper = mount(App);
			await waitForNextTick(wrapper);

			// 複数のTODOを追加
			await addTodo(wrapper, "TODO1");
			expectTodoCount(wrapper, 1);

			await addTodo(wrapper, "TODO2");
			expectTodoCount(wrapper, 2);

			// 各TODOが正しく表示されることを確認
			const todoTexts = wrapper.findAll(".todo-text");
			expect(todoTexts[0].text()).toBe("TODO1");
			expect(todoTexts[1].text()).toBe("TODO2");
		});
	});

	describe("エラーシナリオのE2E", () => {
		it("ネットワークエラーから回復する", async () => {
			setupSequentialFetch(
				createErrorResponse(500, { error: "Server Error" }), // 初期取得エラー
				createSuccessResponse(mockTodos.single), // 回復後の取得
				createSuccessResponse({ id: 2, title: "新しいTODO", is_completed: false }), // 追加成功
				createSuccessResponse([...mockTodos.single, { id: 2, title: "新しいTODO", is_completed: false }])
			);

			wrapper = mount(App);
			await waitForNextTick(wrapper);

			// エラー状態
			expectErrorMessage(wrapper, "TODOの取得に失敗しました");

			// 手動でfetchTodosを呼び出して回復をシミュレート
			await wrapper.vm.fetchTodos();
			await waitForNextTick(wrapper);

			// 回復後はTODOが表示される
			expectTodosVisible(wrapper);
			expectTodoCount(wrapper, 1);

			// その後の操作は正常に動作する
			await addTodo(wrapper, "新しいTODO");
			expectTodoCount(wrapper, 2);
		});

		it("部分的なエラーでもアプリが継続して動作する", async () => {
			setupSequentialFetch(
				createSuccessResponse(mockTodos.single), // 初期取得成功
				createErrorResponse(400, { title: "Validation Error" }), // 追加エラー
				createSuccessResponse({ id: 2, title: "正しいTODO", is_completed: false }), // 2回目の追加成功
				createSuccessResponse([...mockTodos.single, { id: 2, title: "正しいTODO", is_completed: false }])
			);

			wrapper = mount(App);
			await waitForNextTick(wrapper);

			// 初期状態は正常
			expectTodosVisible(wrapper);
			expectTodoCount(wrapper, 1);

			// 無効なTODO追加を試行
			await addTodo(wrapper, "無効なTODO");
			expectErrorMessage(wrapper, "TODOの追加に失敗しました");
			expectTodoCount(wrapper, 1); // TODOは追加されない

			// 有効なTODO追加は成功する
			await addTodo(wrapper, "正しいTODO");
			expectTodoCount(wrapper, 2);
		});
	});

	describe("ユーザビリティテスト", () => {
		it("空文字でのTODO追加を適切に処理する", async () => {
			setupSuccessfulFetch(mockTodos.empty);

			wrapper = mount(App);
			await waitForNextTick(wrapper);

			// 空文字で追加を試行
			await addTodo(wrapper, "");

			// POST リクエストが送信されないことを確認
			expectFetchCallCount(1); // 初期取得のみ
			expectEmptyState(wrapper);
		});

		it("連続したユーザー操作を正しく処理する", async () => {
			setupSequentialFetch(
				createSuccessResponse(mockTodos.empty),
				createSuccessResponse({ id: 1, title: "TODO1", is_completed: false }),
				createSuccessResponse([{ id: 1, title: "TODO1", is_completed: false }]),
				createSuccessResponse({ id: 1, title: "TODO1", is_completed: true }),
				createSuccessResponse([{ id: 1, title: "TODO1", is_completed: true }]),
				createSuccessResponse({ id: 1, title: "TODO1", is_completed: false }),
				createSuccessResponse([{ id: 1, title: "TODO1", is_completed: false }])
			);

			wrapper = mount(App);
			await waitForNextTick(wrapper);

			// TODO追加
			await addTodo(wrapper, "TODO1");

			// 連続したトグル操作
			await toggleTodo(wrapper, 0); // 完了にする
			expect(wrapper.find(".todo-text").classes()).toContain("completed");

			await toggleTodo(wrapper, 0); // 未完了に戻す
			expect(wrapper.find(".todo-text").classes()).not.toContain("completed");

			expectFetchCallCount(7);
		});
	});

	describe("パフォーマンステスト", () => {
		it("大量のTODOを効率的に表示する", async () => {
			const largeTodoList = Array.from({ length: 100 }, (_, i) => ({
				id: i + 1,
				title: `TODO ${i + 1}`,
				is_completed: i % 3 === 0,
			}));

			setupSuccessfulFetch(largeTodoList);

			wrapper = mount(App);
			await waitForNextTick(wrapper);

			expectTodoCount(wrapper, 100);

			// 最初と最後のTODOが正しく表示されることを確認
			const todoTexts = wrapper.findAll(".todo-text");
			expect(todoTexts[0].text()).toBe("TODO 1");
			expect(todoTexts[99].text()).toBe("TODO 100");

			// 完了状態が正しく反映されることを確認
			const checkboxes = wrapper.findAll(".todo-checkbox");
			expect(checkboxes[0].element.checked).toBe(true); // 1番目（インデックス0）は完了
			expect(checkboxes[1].element.checked).toBe(false); // 2番目（インデックス1）は未完了
			expect(checkboxes[2].element.checked).toBe(false); // 3番目（インデックス2）は未完了
			expect(checkboxes[3].element.checked).toBe(true); // 4番目（インデックス3）は完了
		});
	});
});
