# フロントエンドテスト仕様書

## テスト概要

このドキュメントは、Vue.js + Vite で構築された TODO アプリケーションのテスト仕様について説明します。

## テスト環境

-   **テストフレームワーク**: Vitest
-   **テストユーティリティ**: Vue Test Utils
-   **モックライブラリ**: Vitest (内蔵)
-   **DOM 環境**: happy-dom

## テストファイル構成

```
src/tests/
├── setup.js           # テストセットアップとユーティリティ関数
├── basic.test.js      # 基本的なコンポーネントテスト
├── api.test.js        # API統合テスト
├── App.test.js        # 包括的なコンポーネントテスト
├── unit.test.js       # ユニットテスト
├── integration.test.js # 統合テスト
└── e2e.test.js        # エンドツーエンドテスト
```

## テスト項目

### 1. 基本テスト (basic.test.js)

-   ✅ コンポーネントのマウント
-   ✅ 初期状態の表示
-   ✅ DOM 要素の存在確認
-   ✅ データバインディング
-   ✅ CSS クラスの適用
-   ✅ エラーメッセージ表示
-   ✅ 初期 API 呼び出し

### 2. API 操作テスト (api.test.js)

-   ✅ TODO 追加 (成功・失敗)
-   ✅ TODO 更新 (成功・失敗)
-   ✅ TODO 削除 (成功・失敗)
-   ✅ ネットワークエラーハンドリング
-   ✅ バリデーション（空文字チェック）

### 3. 包括的テスト (App.test.js)

-   ✅ 初期表示テスト
-   ✅ TODO 追加機能
-   ✅ TODO 更新機能
-   ✅ TODO 削除機能
-   ✅ スタイリング
-   ✅ エラーハンドリング

## テスト実行コマンド

```bash
# 全てのテストを実行
npm test

# テストを一度だけ実行
npm run test:run

# 特定のテストファイルを実行
npm test -- basic.test.js

# カバレッジレポート付きでテスト実行
npm run test:coverage

# ウォッチモードでテスト実行
npm run test:watch

# UIモードでテスト実行
npm run test:ui
```

## API モック

テストでは`fetch`関数をモックして、以下の API エンドポイントをシミュレートしています：

-   `GET /todos` - TODO 一覧取得
-   `POST /todos/` - TODO 追加
-   `PATCH /todos/:id` - TODO 更新
-   `DELETE /todos/:id` - TODO 削除

## テストカバレッジ

カバレッジレポートには以下が含まれます：

-   **行カバレッジ**: 実行された行の割合
-   **関数カバレッジ**: 呼び出された関数の割合
-   **ブランチカバレッジ**: 実行された分岐の割合
-   **ステートメントカバレッジ**: 実行されたステートメントの割合

## テストのベストプラクティス

1. **独立性**: 各テストは他のテストに依存しない
2. **予測可能性**: 同じ入力に対して常に同じ結果を返す
3. **明確性**: テスト名と内容が明確で理解しやすい
4. **完全性**: 正常系と異常系の両方をテストする
5. **保守性**: テストコードも保守しやすく書く

## トラブルシューティング

### よくある問題と解決方法

1. **非同期処理の待機**

    ```javascript
    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 0));
    ```

2. **fetch モックのリセット**

    ```javascript
    beforeEach(() => {
    	fetch.mockClear();
    });
    ```

3. **Vue 3 でのデータ設定**
    ```javascript
    // Vue 3では setData は使用できない
    wrapper.vm.todos.push(newTodo);
    ```

## 今後の拡張

-   **Visual Regression Tests**: スクリーンショット比較テスト
-   **Performance Tests**: レンダリング性能テスト
-   **Accessibility Tests**: アクセシビリティテスト
-   **Cross-browser Tests**: ブラウザ間互換性テスト
