import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import App from "../App.vue";

// fetchのモック
global.fetch = vi.fn();

describe("App.vue - 基本テスト", () => {
	beforeEach(() => {
		fetch.mockClear();
		fetch.mockResolvedValue({
			ok: true,
			json: async () => [],
		});
	});

	it("コンポーネントが正常にマウントされる", () => {
		const wrapper = mount(App);
		expect(wrapper.exists()).toBe(true);
		expect(wrapper.find("h1").text()).toBe("TODOリスト");
	});

	it("初期状態で空のメッセージが表示される", async () => {
		const wrapper = mount(App);
		await wrapper.vm.$nextTick();

		// 少し待機してからチェック
		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(wrapper.find(".empty-state").exists()).toBe(true);
	});

	it("TODO入力フィールドが存在する", () => {
		const wrapper = mount(App);
		expect(wrapper.find(".todo-input").exists()).toBe(true);
		expect(wrapper.find(".add-button").exists()).toBe(true);
	});

	it("TODOデータを手動で追加できる", async () => {
		const wrapper = mount(App);

		// 手動でTODOを追加
		wrapper.vm.todos.push({ id: 1, title: "テストTODO", is_completed: false });
		await wrapper.vm.$nextTick();

		expect(wrapper.find(".todo-item").exists()).toBe(true);
		expect(wrapper.find(".todo-text").text()).toBe("テストTODO");
	});

	it("完了状態のTODOに正しいクラスが適用される", async () => {
		const wrapper = mount(App);

		// 完了済みTODOを追加
		wrapper.vm.todos.push({ id: 1, title: "完了TODO", is_completed: true });
		await wrapper.vm.$nextTick();

		expect(wrapper.find(".todo-text").classes()).toContain("completed");
	});

	it("エラーメッセージが正しく表示される", async () => {
		const wrapper = mount(App);

		// エラーを設定
		wrapper.vm.error = "テストエラー";
		await wrapper.vm.$nextTick();

		expect(wrapper.find(".error-message").exists()).toBe(true);
		expect(wrapper.find(".error-message").text()).toBe("テストエラー");
	});

	it("入力フィールドの双方向バインディングが動作する", async () => {
		const wrapper = mount(App);
		const input = wrapper.find(".todo-input");

		await input.setValue("新しいTODO");
		expect(wrapper.vm.newTitle).toBe("新しいTODO");
	});

	it("fetchTodosが初期化時に呼ばれる", () => {
		mount(App);
		expect(fetch).toHaveBeenCalledWith("/todos", { mode: "cors" });
	});
});
