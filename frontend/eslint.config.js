import js from "@eslint/js";
import vue from "eslint-plugin-vue";

export default [
	js.configs.recommended,
	...vue.configs["flat/recommended"],
	{
		files: ["**/*.{js,vue}"],
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			globals: {
				console: "readonly",
				process: "readonly",
				fetch: "readonly",
				setTimeout: "readonly",
				clearTimeout: "readonly",
				setInterval: "readonly",
				clearInterval: "readonly",
			},
		},
		rules: {
			// Vue固有のルール
			"vue/multi-word-component-names": "off",
			"vue/no-unused-vars": "error",

			// JavaScript一般のルール
			"no-unused-vars": "warn",
			"no-console": "warn",
			semi: ["error", "always"],
			quotes: ["error", "single"],
		},
	},
	{
		files: ["**/*.test.js", "**/tests/**/*.js"],
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			globals: {
				console: "readonly",
				process: "readonly",
				fetch: "readonly",
				setTimeout: "readonly",
				clearTimeout: "readonly",
				setInterval: "readonly",
				clearInterval: "readonly",
				global: "writable",
				expect: "readonly",
				test: "readonly",
				describe: "readonly",
				it: "readonly",
				beforeEach: "readonly",
				afterEach: "readonly",
				beforeAll: "readonly",
				afterAll: "readonly",
				vi: "readonly",
			},
		},
		rules: {
			"no-unused-vars": "warn",
			"no-console": "warn",
		},
	},
	{
		files: ["**/*.config.js", "**/vite.config.js"],
		languageOptions: {
			globals: {
				process: "readonly",
				__dirname: "readonly",
			},
		},
	},
];
