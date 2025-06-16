import js from "@eslint/js";

export default [
	js.configs.recommended,
	{
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: "module",
			globals: {
				// ブラウザ環境のグローバル変数
				window: "readonly",
				document: "readonly",
				console: "readonly",
				// Node.js環境のグローバル変数（必要に応じて）
				process: "readonly",
				global: "readonly",
				Buffer: "readonly",
			},
		},
		rules: {
			// 基本的なルール
			"no-unused-vars": "warn",
			"no-console": "off",
			semi: ["error", "always"],
			quotes: ["error", "single"],
			indent: ["error", 2],
			"no-trailing-spaces": "error",
			"eol-last": "error",
		},
	},
	{
		files: ["**/*.js", "**/*.mjs"],
		rules: {
			// JavaScript固有のルール
		},
	},
];
