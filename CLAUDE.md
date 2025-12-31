# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GAIT試験（Global Assessment of Information Technology）の学習サイト。クイズアプリとドキュメントサイトで構成。フロントエンドのみ、サーバーサイド不要。

## Development Commands

```bash
# クイズアプリ起動
npx serve quiz-app -p 3000

# ドキュメントサイト起動
npx serve docs -p 4000

# 停止（Windows コマンドプロンプト）
for /f "tokens=5" %a in ('netstat -ano ^| findstr :3000') do taskkill /PID %a /F
for /f "tokens=5" %a in ('netstat -ano ^| findstr :4000') do taskkill /PID %a /F
```

| サイト | URL |
|--------|-----|
| クイズアプリ | http://localhost:3000 |
| ドキュメント | http://localhost:4000 |

### VSCode タスク

`.vscode/tasks.json` に定義済み。`Ctrl + Shift + P` → `Tasks: Run Task` から実行：

| タスク | 説明 |
|--------|------|
| Start Quiz App | クイズアプリ起動（:3000） |
| Stop Quiz App | クイズアプリ停止 |
| Start Docs | ドキュメント起動（:4000） |
| Stop Docs | ドキュメント停止 |

## Architecture

### フォルダ構成
- `docs/` - Docsifyドキュメントサイト
- `quiz-app/` - クイズWebアプリケーション

### quiz-app構成
- `index.html` - 3画面（スタート、クイズ、結果）をシングルページで管理
- `js/app.js` - `QuizApp`クラスが全ロジックを担当
- `css/style.css` - レスポンシブ対応のダークテーマUI
- `data/questions.json` - 問題データ

### docs構成（Docsify）
- `index.html` - Docsify設定・テーマ
- `README.md` - トップページ
- `_sidebar.md` - サイドバーナビゲーション
- `*.md` - 各ドキュメントページ

### QuizAppクラスの主要機能

**クイズフロー：**
1. `init()` → JSON読み込み、localStorage読み込み、UI初期化
2. `startQuiz(random)` → カテゴリフィルター、シャッフル
3. `showQuestion()` → 問題表示、選択肢生成
4. `selectAnswer(index)` → 正誤判定、解説表示（模擬試験モードでは即次へ）
5. `showResults()` → スコア集計、データ保存

**学習モード：**
- 通常モード：順番/ランダム出題、即時フィードバック
- 復習モード：`startReviewMode()` - 間違えた問題のみ出題
- お気に入りモード：`startBookmarkQuiz()` - ブックマークした問題のみ
- 模擬試験モード：`startExam(type)` - GAIT2.0(160問/60分) / e-GAIT2.0(80問/30分)
- 単問練習：`startSingleQuestion(id)` - 問題一覧から特定の問題を練習

**問題一覧画面：**
- `showQuestionList()` - 全問題をリスト表示
- カテゴリ/難易度/出典でフィルタ、ID/カテゴリ/難易度/正答率/回答数でソート
- 問題ごとの正答率・回答履歴を表示

**データ構造（localStorage キー: `gait_quiz_data`）：**
```javascript
{
  history: [{ date, correct, total, isReview }],
  wrongQuestions: [questionId, ...],
  categoryStats: { "カテゴリ名": { correct, total } },
  examHistory: [{ date, type, score, rank, correct, total }],
  bookmarks: [questionId, ...],
  questionStats: { "questionId": { correct, total, lastAnswered } }
}
```

## Adding Questions

`quiz-app/data/questions.json`に追加（現在200問、id 1-200）：

```json
{
  "id": 201,
  "category": "カテゴリ名",
  "question": "問題文？",
  "choices": ["選択肢A", "選択肢B", "選択肢C", "選択肢D"],
  "answer": 0,
  "explanation": "解説文",
  "difficulty": 2,
  "source": {"type": "original"}
}
```

- `answer`: 正解インデックス（0=A, 1=B, 2=C, 3=D）
- `category`: 8カテゴリ（インフラストラクチャ、OS・ミドルウェア、データベース、アプリケーション、クラウド、セキュリティ、DX技術、DX利活用）
- `id`: 一意であること（連番管理、次は201から）
- `difficulty`: 難易度（1=初級, 2=中級, 3=上級）※省略時は中級扱い
- `source`: 出典情報（UI表示される）
  - `type`: `original`(オリジナル) / `official`(公式サンプル) / `reference`(参考サイト)
  - `name`: 出典名（任意）
  - `url`: 参考URL（任意、ツールチップ表示）

## Adding Documentation

`docs/` 配下にMarkdownファイルを追加し、`docs/_sidebar.md` にリンクを追記。
Docsifyはビルド不要で、ファイル追加後すぐに反映される。
