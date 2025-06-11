import { beforeEach, afterEach, vi } from "vitest";

// グローバルなテストセットアップ
beforeEach(() => {
	// console エラーを抑制（テスト環境での不要な出力を避けるため）
	vi.spyOn(console, "error").mockImplementation(() => {});
	vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
	// モックをリストア
	vi.restoreAllMocks();

	// グローバルfetchをクリア
	if (global.fetch && typeof global.fetch.mockClear === "function") {
		global.fetch.mockClear();
	}
});

// テスト用のユーティリティ関数
export const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

export const waitForNextTick = async (wrapper) => {
	await wrapper.vm.$nextTick();
	await flushPromises();
};

// モックデータ
export const mockTodos = {
	empty: [],
	single: [{ id: 1, title: "テストTODO", is_completed: false }],
	multiple: [
		{ id: 1, title: "TODO1", is_completed: false },
		{ id: 2, title: "TODO2", is_completed: true },
		{ id: 3, title: "TODO3", is_completed: false },
	],
	completed: [{ id: 1, title: "完了済みTODO", is_completed: true }],
};

// APIレスポンスのモックヘルパー
export const createSuccessResponse = (data) => ({
	ok: true,
	json: async () => data,
});

export const createErrorResponse = (status = 400, errorData = {}) => ({
	ok: false,
	status,
	json: async () => errorData,
});

export const createNetworkError = (message = "Network Error") => {
	throw new Error(message);
};

// fetchモックのセットアップヘルパー
export const setupSuccessfulFetch = (data) => {
	global.fetch = vi.fn().mockResolvedValue(createSuccessResponse(data));
};

export const setupFailedFetch = (status = 400, errorData = {}) => {
	global.fetch = vi.fn().mockResolvedValue(createErrorResponse(status, errorData));
};

export const setupNetworkErrorFetch = (message) => {
	global.fetch = vi.fn().mockImplementation(() => createNetworkError(message));
};

// 複数のレスポンスを順番に返すfetchモック
export const setupSequentialFetch = (...responses) => {
	global.fetch = vi.fn();
	responses.forEach((response, index) => {
		if (typeof response === "function") {
			global.fetch.mockImplementationOnce(response);
		} else {
			global.fetch.mockResolvedValueOnce(response);
		}
	});
};

// DOM要素の検索ヘルパー
export const findByTestId = (wrapper, testId) => wrapper.find(`[data-testid="${testId}"]`);
export const findAllByTestId = (wrapper, testId) => wrapper.findAll(`[data-testid="${testId}"]`);

// フォーム操作のヘルパー
export const fillAndSubmitForm = async (wrapper, inputSelector, value, formSelector = "form") => {
	const input = wrapper.find(inputSelector);
	await input.setValue(value);

	const form = wrapper.find(formSelector);
	await form.trigger("submit.prevent");

	await waitForNextTick(wrapper);
};

// TODO操作のヘルパー
export const addTodo = async (wrapper, title) => {
	return fillAndSubmitForm(wrapper, ".todo-input", title, ".add-form");
};

export const toggleTodo = async (wrapper, index = 0) => {
	const checkboxes = wrapper.findAll(".todo-checkbox");
	if (checkboxes[index]) {
		await checkboxes[index].trigger("change");
		await waitForNextTick(wrapper);
	}
};

export const deleteTodo = async (wrapper, index = 0) => {
	const deleteButtons = wrapper.findAll(".delete-button");
	if (deleteButtons[index]) {
		await deleteButtons[index].trigger("click");
		await waitForNextTick(wrapper);
	}
};

// アサーションヘルパー
export const expectTodoCount = (wrapper, count) => {
	expect(wrapper.findAll(".todo-item")).toHaveLength(count);
};

export const expectEmptyState = (wrapper) => {
	expect(wrapper.find(".empty-state").exists()).toBe(true);
	expect(wrapper.find(".todos-list").exists()).toBe(false);
};

export const expectTodosVisible = (wrapper) => {
	expect(wrapper.find(".empty-state").exists()).toBe(false);
	expect(wrapper.find(".todos-list").exists()).toBe(true);
};

export const expectErrorMessage = (wrapper, message) => {
	expect(wrapper.find(".error-message").exists()).toBe(true);
	expect(wrapper.find(".error-message").text()).toBe(message);
};

export const expectNoErrorMessage = (wrapper) => {
	expect(wrapper.find(".error-message").exists()).toBe(false);
};

// API呼び出しのアサーションヘルパー
export const expectFetchCalledWith = (method, url, options = {}) => {
	if (method === "GET") {
		expect(fetch).toHaveBeenCalledWith(url, { mode: "cors" });
	} else {
		expect(fetch).toHaveBeenCalledWith(url, {
			method,
			headers: { "Content-Type": "application/json" },
			...options,
		});
	}
};

export const expectFetchCallCount = (count) => {
	expect(fetch).toHaveBeenCalledTimes(count);
};
