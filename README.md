# GAIT試験 学習サイト

GAIT（Global Assessment of Information Technology）試験対策用の学習サイトです。

## サイト構成

| サイト | URL | 説明 |
|--------|-----|------|
| クイズアプリ | http://localhost:3000 | 4択問題で実践練習 |
| ドキュメント | http://localhost:4000 | 試験情報・学習資料 |

## 機能

### クイズアプリ
- **80問の問題** - 8カテゴリ各10問を収録
- **カテゴリ別学習** - 8つの技術分野から選択して学習可能
- **2つの出題モード** - 順番/ランダム出題を選択
- **即時フィードバック** - 回答後すぐに正誤と解説を表示
- **模擬試験モード** - GAIT2.0（160問/60分）・e-GAIT2.0（80問/30分）形式で本番対策
- **お気に入り機能** - 重要な問題をブックマークして後で復習
- **復習モード** - 間違えた問題だけを出題
- **学習ダッシュボード** - 学習履歴、連続学習日数、カテゴリ別習熟度を可視化
- **レスポンシブ対応** - PC・スマートフォンどちらでも利用可能

### ドキュメントサイト
- **Docsify** による軽量ドキュメントサイト
- 8カテゴリ別の学習ページ
- 試験直前用チートシート
- サイドバーナビゲーション・全文検索機能

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

`quiz-app/data/questions.json` を編集して問題を追加できます（現在80問収録、id 1-80）。

```json
{
  "id": 81,
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
| id | 一意のID（連番、次は81から） |
| category | カテゴリ名（8カテゴリ：インフラストラクチャ、OS・ミドルウェア、データベース、アプリケーション、クラウド、セキュリティ、DX技術、DX利活用） |
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
│   ├── GAIT試験調査結果.md
│   ├── cheatsheet.md            # チートシート
│   ├── infrastructure.md        # カテゴリ別学習ページ
│   ├── os-middleware.md
│   ├── database.md
│   ├── application.md
│   ├── cloud.md
│   ├── security.md
│   ├── dx-technology.md
│   └── dx-utilization.md
└── quiz-app/                    # クイズアプリ
    ├── index.html
    ├── css/
    │   └── style.css
    ├── js/
    │   └── app.js
    └── data/
        └── questions.json       # 80問（8カテゴリ×10問）
```

## 技術スタック

- **クイズアプリ**: HTML5 / CSS3 / JavaScript（ES6+）、localStorage
- **ドキュメント**: Docsify
- フレームワーク不使用（Vanilla JS）

## ライセンス

MIT License
