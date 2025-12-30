# GAIT試験 練習問題アプリ

GAIT（Global Assessment of Information Technology）試験対策用の4択クイズWebアプリケーションです。

## 機能

- **カテゴリ別学習** - 7つの技術分野から選択して学習可能
- **2つの出題モード** - 順番/ランダム出題を選択
- **即時フィードバック** - 回答後すぐに正誤と解説を表示
- **成績分析** - カテゴリ別の正答率をグラフで表示
- **レスポンシブ対応** - PC・スマートフォンどちらでも利用可能

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

- Node.js（npx使用）または Python 3.x

### 起動方法

```bash
# Node.jsの場合
npx serve quiz-app -p 3000

# Pythonの場合
cd quiz-app
python -m http.server 3000
```

ブラウザで http://localhost:3000 にアクセス

### 停止方法

起動中のターミナルで `Ctrl + C` を押すか、別ターミナルから以下を実行：

```cmd
# Windows（コマンドプロンプト）
for /f "tokens=5" %a in ('netstat -ano ^| findstr :3000') do taskkill /PID %a /F
```

```bash
# Mac / Linux
kill $(lsof -t -i:3000)
```

### VSCode タスク

VSCodeでは `Ctrl + Shift + P` → `Tasks: Run Task` から起動・停止が可能です。

## 使い方

1. トップ画面でカテゴリを選択（全カテゴリも可）
2. 「順番に解く」または「ランダムに解く」を選択
3. 4つの選択肢から回答を選択
4. 解説を確認して「次の問題へ」
5. 全問終了後、成績を確認

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
│   └── tasks.json           # 起動・停止タスク
├── docs/                    # 学習資料
│   └── GAIT試験調査結果.md
└── quiz-app/                # Webアプリケーション
    ├── index.html
    ├── css/
    │   └── style.css
    ├── js/
    │   └── app.js
    └── data/
        └── questions.json   # 問題データ
```

## 技術スタック

- HTML5 / CSS3 / JavaScript（ES6+）
- フレームワーク不使用（Vanilla JS）
- ローカルWebサーバーで動作

## ライセンス

MIT License
