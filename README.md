# Todo Rails アプリケーション

Vue.js（フロントエンド）と Ruby on Rails（バックエンド API）を使用したモダンな Todo アプリケーションです。

## 🎯 プロジェクト概要

このプロジェクトは、フルスタック開発の学習を目的とした Todo アプリケーションです。
レスポンシブデザイン対応で、PC・タブレット・スマートフォンで快適に利用できます。

## 📁 プロジェクト構成

```
todo-rails/
├── backend/        # Rails API サーバー (ポート: 3000)
├── frontend/       # Vue.js アプリケーション (ポート: 5173)
└── README.md       # このファイル
```

## 🔧 技術スタック

### バックエンド (Rails API)

-   **Ruby on Rails 8.0.2** - API サーバーフレームワーク
-   **SQLite3** - 開発用データベース
-   **Puma** - Web サーバー
-   **rack-cors** - CORS 対応
-   **rspec-rails** - テストフレームワーク
-   **rubocop** - コード品質管理

### フロントエンド (Vue.js)

-   **Vue.js 3** - Composition API 対応
-   **Vite** - 高速ビルドツール
-   **JavaScript ES6+** - モダン JavaScript

## 🚀 主な機能

-   ✅ **Todo 追加** - 新しいタスクを素早く追加
-   ✅ **Todo 一覧表示** - 全てのタスクを見やすく表示
-   ✅ **Todo 完了切り替え** - チェックボックスで完了/未完了を切り替え
-   ✅ **Todo 削除** - 不要なタスクを削除
-   ✅ **レスポンシブデザイン** - PC・タブレット・スマホ対応
-   ✅ **エラーハンドリング** - 分かりやすいエラーメッセージ表示

## 🎨 UI/UX 特徴

-   **モダンなデザイン** - クリーンで見やすいカードベースのレイアウト
-   **直感的な操作** - ホバーエフェクトやフォーカス状態の改善
-   **アクセシビリティ** - キーボード操作対応
-   **パフォーマンス** - 高速な API 通信と画面更新

## ⚙️ セットアップ

### 前提条件

-   Ruby 3.x
-   Node.js 18.x 以上
-   npm または yarn

### 1. プロジェクトのクローン

```bash
git clone <repository-url>
cd todo-rails
```

### 2. バックエンド（Rails）のセットアップ

```bash
cd backend
bundle install
rails db:create
rails db:migrate
rails db:seed  # サンプルデータ投入（オプション）
```

### 3. フロントエンド（Vue.js）のセットアップ

```bash
cd frontend
npm install
```

## 🚀 開発サーバーの起動

### バックエンド（Rails API）

```bash
cd backend
rails server
```

→ http://localhost:3000 で API 稼働

### フロントエンド（Vue.js）

```bash
cd frontend
npm run dev
```

→ http://localhost:5173 でアプリケーション稼働

## 🔗 API エンドポイント

| メソッド | エンドポイント | 説明          | パラメータ                          |
| -------- | -------------- | ------------- | ----------------------------------- |
| GET      | `/todos`       | Todo 一覧取得 | -                                   |
| POST     | `/todos`       | Todo 新規作成 | `{ todo: { title, is_completed } }` |
| GET      | `/todos/:id`   | Todo 詳細取得 | -                                   |
| PATCH    | `/todos/:id`   | Todo 更新     | `{ todo: { title, is_completed } }` |
| DELETE   | `/todos/:id`   | Todo 削除     | -                                   |

### レスポンス例

```json
{
	"id": 1,
	"title": "Vue.jsを学ぶ",
	"is_completed": false,
	"created_at": "2025-06-10T12:00:00.000Z",
	"updated_at": "2025-06-10T12:00:00.000Z"
}
```

## 🧪 テスト実行

### バックエンドテスト

```bash
cd backend
bundle exec rspec
```

### コード品質チェック

```bash
cd backend
bundle exec rubocop
```

## 📱 レスポンシブ対応

-   **PC（1024px 以上）** - 最大幅 1200px、広々としたレイアウト
-   **タブレット（769px-1024px）** - 最大幅 900px、中程度のレイアウト
-   **スマートフォン（768px 以下）** - 画面幅 100%、縦向きレイアウト

## 🔧 主要な技術的実装

### CORS 設定

```ruby
# backend/config/initializers/cors.rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins 'http://localhost:5173'
    resource '*', headers: :any, methods: [:get, :post, :put, :patch, :delete, :options, :head]
  end
end
```

### Vite プロキシ設定

```javascript
// frontend/vite.config.js
export default defineConfig({
	server: {
		proxy: {
			"/todos": "http://localhost:3000",
		},
	},
});
```

## 🚧 今後の改善予定

-   [ ] ユーザー認証機能
-   [ ] Todo カテゴリ機能
-   [ ] 優先度設定
-   [ ] 期限設定
-   [ ] ダークモード対応
-   [ ] PWA 対応
-   [ ] Docker 対応

## 📝 開発メモ

### 解決した課題

1. **422 Unprocessable Content エラー** - Rails API 設定と CSRF 無効化で解決
2. **CORS エラー** - rack-cors と origins 設定で解決
3. **API 通信エラー** - Vite プロキシ設定で解決
4. **レスポンシブデザイン** - CSS Grid/Flexbox とメディアクエリで実装

### アーキテクチャ設計

-   **フロントエンド** - Vue.js Composition API 採用
-   **バックエンド** - Rails API-only モード
-   **データベース** - RESTful API 設計
-   **スタイリング** - Scoped CSS、BEM ライクな命名規則

## 👥 貢献

1. このプロジェクトをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. コミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## 🆘 トラブルシューティング

### よくある問題

**Q: API 通信で CORS エラーが発生する**
A: `backend/config/initializers/cors.rb`で origins 設定を確認してください。

**Q: Vite サーバーでプロキシが効かない**
A: `frontend/vite.config.js`の proxy 設定と、API リクエストが相対パス（`/todos`）になっているか確認してください。

**Q: Rails サーバーが起動しない**
A: `bundle install`を実行し、Gemfile の依存関係を確認してください。
