# GAIT試験 学習サイト

GAIT（Global Assessment of Information Technology）試験対策用の学習サイトです。

## サイト構成

| サイト | URL | 説明 |
|--------|-----|------|
| クイズアプリ | http://localhost:3000 | 4択問題で実践練習 |
| ドキュメント | http://localhost:4000 | 試験情報・学習資料 |

## 機能

### クイズアプリ
- **カテゴリ別学習** - 7つの技術分野から選択して学習可能
- **2つの出題モード** - 順番/ランダム出題を選択
- **即時フィードバック** - 回答後すぐに正誤と解説を表示
- **学習履歴** - ローカルストレージで学習回数・正答率を記録
- **復習モード** - 間違えた問題だけを出題
- **苦手分析** - カテゴリ別の正答率をグラフ表示
- **レスポンシブ対応** - PC・スマートフォンどちらでも利用可能

### ドキュメントサイト
- **Docsify** による軽量ドキュメントサイト
- サイドバーナビゲーション
- 全文検索機能

## カテゴリ（GAIT2.0準拠）

- インフラストラクチャ
- OS・ミドルウェア
- データベース
- アプリケーション
- クラウド
- セキュリティ
- DX技術
- DX利活用

## セットアップ

### 必要環境

- Node.js（npx使用）

### 起動方法

```bash
# クイズアプリ
npx serve quiz-app -p 3000

# ドキュメントサイト
npx serve docs -p 4000
```

### 停止方法

起動中のターミナルで `Ctrl + C` を押すか、別ターミナルから以下を実行：

```cmd
# クイズアプリ停止（Windows）
for /f "tokens=5" %a in ('netstat -ano ^| findstr :3000') do taskkill /PID %a /F

# ドキュメント停止（Windows）
for /f "tokens=5" %a in ('netstat -ano ^| findstr :4000') do taskkill /PID %a /F
```

```bash
# Mac / Linux
kill $(lsof -t -i:3000)
kill $(lsof -t -i:4000)
```

### VSCode タスク

`Ctrl + Shift + P` → `Tasks: Run Task` から実行：

| タスク | 説明 |
|--------|------|
| Start Quiz App | クイズアプリ起動（:3000） |
| Stop Quiz App | クイズアプリ停止 |
| Start Docs | ドキュメント起動（:4000） |
| Stop Docs | ドキュメント停止 |

## 問題の追加

`quiz-app/data/questions.json` を編集して問題を追加できます。

```json
{
  "id": 16,
  "category": "セキュリティ",
  "question": "問題文をここに記載？",
  "choices": [
    "選択肢A",
    "選択肢B",
    "選択肢C",
    "選択肢D"
  ],
  "answer": 0,
  "explanation": "解説文をここに記載"
}
```

| フィールド | 説明 |
|-----------|------|
| id | 一意のID（連番） |
| category | カテゴリ名（新規カテゴリも自動認識） |
| question | 問題文 |
| choices | 選択肢の配列（4つ） |
| answer | 正解のインデックス（0〜3） |
| explanation | 解説文 |

## フォルダ構成

```
GAIT/
├── README.md
├── CLAUDE.md
├── .gitignore
├── .vscode/
│   └── tasks.json
├── docs/                        # ドキュメントサイト（Docsify）
│   ├── index.html
│   ├── README.md
│   ├── _sidebar.md
│   ├── .nojekyll
│   └── GAIT試験調査結果.md
└── quiz-app/                    # クイズアプリ
    ├── index.html
    ├── css/
    │   └── style.css
    ├── js/
    │   └── app.js
    └── data/
        └── questions.json
```

## 技術スタック

- **クイズアプリ**: HTML5 / CSS3 / JavaScript（ES6+）、localStorage
- **ドキュメント**: Docsify
- フレームワーク不使用（Vanilla JS）

## ライセンス

MIT License
