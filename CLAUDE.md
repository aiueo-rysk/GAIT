# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GAIT試験（Global Assessment of Information Technology）の学習用4択クイズWebアプリケーション。フロントエンドのみで構成され、サーバーサイド不要。

## Development Commands

```bash
# 開発サーバー起動（Node.js）
npx serve quiz-app -p 3000

# 停止（Windows コマンドプロンプト）
for /f "tokens=5" %a in ('netstat -ano ^| findstr :3000') do taskkill /PID %a /F

# アクセスURL
http://localhost:3000/
```

JSONファイルのfetchにWebサーバーが必要なため、ファイルを直接ブラウザで開くことは不可。

### VSCode タスク

`.vscode/tasks.json` に定義済み。`Ctrl + Shift + P` → `Tasks: Run Task` から実行：
- **Start Server** - サーバー起動
- **Stop Server** - サーバー停止

## Architecture

### フォルダ構成
- `docs/` - 学習資料・調査ドキュメント
- `quiz-app/` - Webアプリケーション本体

### quiz-app構成
- `index.html` - 3画面（スタート、クイズ、結果）をシングルページで管理
- `js/app.js` - `QuizApp`クラスが全ロジックを担当
- `css/style.css` - レスポンシブ対応のダークテーマUI
- `data/questions.json` - 問題データ（追加・編集はこのファイルのみ）

### QuizAppクラスの主要フロー
1. `init()` → JSONから問題読み込み、カテゴリセレクト生成
2. `startQuiz(random)` → カテゴリフィルター適用、シャッフル（任意）
3. `showQuestion()` → 問題表示、選択肢ボタン生成
4. `selectAnswer(index)` → 正誤判定、解説表示
5. `showResults()` → スコア集計、カテゴリ別成績表示

## Adding Questions

`quiz-app/data/questions.json`に追加：

```json
{
  "id": 16,
  "category": "カテゴリ名",
  "question": "問題文？",
  "choices": ["選択肢A", "選択肢B", "選択肢C", "選択肢D"],
  "answer": 0,
  "explanation": "解説文"
}
```

- `answer`: 正解インデックス（0=A, 1=B, 2=C, 3=D）
- `category`: 自由に追加可能（UIのフィルターに自動反映）
- `id`: 一意であること（現在は連番管理）
