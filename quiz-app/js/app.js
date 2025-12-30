// GAIT Quiz Application
class QuizApp {
    constructor() {
        this.questions = [];
        this.currentQuestions = [];
        this.currentIndex = 0;
        this.score = 0;
        this.answers = [];
        this.isRandom = false;
        this.isReviewMode = false;

        // ローカルストレージのキー
        this.STORAGE_KEY = 'gait_quiz_data';

        this.init();
    }

    async init() {
        await this.loadQuestions();
        this.loadStorageData();
        this.setupEventListeners();
        this.updateCategorySelect();
        this.updateQuestionCount();
        this.updateStatsDisplay();
    }

    // ローカルストレージからデータを読み込み
    loadStorageData() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        if (data) {
            this.storageData = JSON.parse(data);
        } else {
            this.storageData = {
                history: [],
                wrongQuestions: [],
                categoryStats: {}
            };
        }
    }

    // ローカルストレージにデータを保存
    saveStorageData() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.storageData));
    }

    // 統計表示を更新
    updateStatsDisplay() {
        const statsContainer = document.getElementById('stats-container');
        if (!statsContainer) return;

        const totalSessions = this.storageData.history.length;
        const wrongCount = this.storageData.wrongQuestions.length;

        // 総合正答率を計算
        let totalCorrect = 0;
        let totalQuestions = 0;
        this.storageData.history.forEach(h => {
            totalCorrect += h.correct;
            totalQuestions += h.total;
        });
        const overallRate = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

        statsContainer.innerHTML = `
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-value">${totalSessions}</span>
                    <span class="stat-label">学習回数</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${overallRate}%</span>
                    <span class="stat-label">総合正答率</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${wrongCount}</span>
                    <span class="stat-label">要復習</span>
                </div>
            </div>
        `;

        // 復習ボタンの状態を更新
        const reviewBtn = document.getElementById('btn-review');
        if (reviewBtn) {
            reviewBtn.disabled = wrongCount === 0;
            reviewBtn.textContent = wrongCount > 0 ? `復習する (${wrongCount}問)` : '復習する問題なし';
        }

        // 苦手カテゴリを表示
        this.updateWeakCategories();
    }

    // 苦手カテゴリを表示
    updateWeakCategories() {
        const container = document.getElementById('weak-categories');
        if (!container) return;

        const stats = this.storageData.categoryStats;
        const categories = Object.keys(stats);

        if (categories.length === 0) {
            container.innerHTML = '<p class="no-data">まだデータがありません</p>';
            return;
        }

        // 正答率でソート（低い順）
        const sorted = categories
            .map(cat => ({
                name: cat,
                rate: Math.round((stats[cat].correct / stats[cat].total) * 100),
                total: stats[cat].total
            }))
            .sort((a, b) => a.rate - b.rate);

        container.innerHTML = sorted.map(cat => `
            <div class="weak-category-item">
                <span class="weak-category-name">${cat.name}</span>
                <div class="weak-category-bar">
                    <div class="weak-category-fill" style="width: ${cat.rate}%"></div>
                </div>
                <span class="weak-category-rate">${cat.rate}%</span>
            </div>
        `).join('');
    }

    async loadQuestions() {
        try {
            const response = await fetch('data/questions.json');
            const data = await response.json();
            this.questions = data.questions;
        } catch (error) {
            console.error('問題の読み込みに失敗しました:', error);
            this.questions = [];
        }
    }

    setupEventListeners() {
        document.getElementById('btn-sequential').addEventListener('click', () => this.startQuiz(false));
        document.getElementById('btn-random').addEventListener('click', () => this.startQuiz(true));
        document.getElementById('btn-review').addEventListener('click', () => this.startReviewMode());
        document.getElementById('btn-next').addEventListener('click', () => this.nextQuestion());
        document.getElementById('btn-retry').addEventListener('click', () => this.retryQuiz());
        document.getElementById('btn-home').addEventListener('click', () => this.goHome());
        document.getElementById('btn-back').addEventListener('click', () => this.goHome());
        document.getElementById('btn-clear-data').addEventListener('click', () => this.clearData());
        document.getElementById('category-select').addEventListener('change', () => this.updateQuestionCount());
    }

    // 復習モードを開始
    startReviewMode() {
        const wrongIds = this.storageData.wrongQuestions;
        if (wrongIds.length === 0) {
            alert('復習する問題がありません');
            return;
        }

        this.currentQuestions = this.questions.filter(q => wrongIds.includes(q.id));
        this.currentQuestions = this.shuffleArray(this.currentQuestions);
        this.isRandom = true;
        this.isReviewMode = true;
        this.currentIndex = 0;
        this.score = 0;
        this.answers = [];

        this.showScreen('quiz-screen');
        this.showQuestion();
    }

    // データをクリア
    clearData() {
        if (confirm('学習履歴をすべて削除しますか？')) {
            this.storageData = {
                history: [],
                wrongQuestions: [],
                categoryStats: {}
            };
            this.saveStorageData();
            this.updateStatsDisplay();
        }
    }

    getCategories() {
        const categories = [...new Set(this.questions.map(q => q.category))];
        return categories.sort();
    }

    updateCategorySelect() {
        const select = document.getElementById('category-select');
        const categories = this.getCategories();

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
        });
    }

    updateQuestionCount() {
        const category = document.getElementById('category-select').value;
        const filtered = this.getFilteredQuestions(category);
        document.getElementById('total-questions').textContent = filtered.length;
    }

    getFilteredQuestions(category) {
        if (category === 'all') {
            return [...this.questions];
        }
        return this.questions.filter(q => q.category === category);
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    startQuiz(random) {
        const category = document.getElementById('category-select').value;
        this.currentQuestions = this.getFilteredQuestions(category);

        if (this.currentQuestions.length === 0) {
            alert('問題がありません');
            return;
        }

        if (random) {
            this.currentQuestions = this.shuffleArray(this.currentQuestions);
        }

        this.isRandom = random;
        this.isReviewMode = false;
        this.currentIndex = 0;
        this.score = 0;
        this.answers = [];

        this.showScreen('quiz-screen');
        this.showQuestion();
    }

    showQuestion() {
        const question = this.currentQuestions[this.currentIndex];
        const total = this.currentQuestions.length;

        // 進捗バー更新
        const progress = ((this.currentIndex) / total) * 100;
        document.getElementById('progress').style.width = `${progress}%`;

        // 問題番号
        document.getElementById('question-number').textContent = `問題 ${this.currentIndex + 1}/${total}`;

        // カテゴリ
        document.getElementById('category-badge').textContent = question.category;

        // 問題文
        document.getElementById('question-text').textContent = question.question;

        // 選択肢
        const choicesContainer = document.getElementById('choices');
        choicesContainer.innerHTML = '';

        const labels = ['A', 'B', 'C', 'D'];
        question.choices.forEach((choice, index) => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.innerHTML = `
                <span class="choice-label">${labels[index]}</span>
                <span class="choice-text">${choice}</span>
            `;
            btn.addEventListener('click', () => this.selectAnswer(index));
            choicesContainer.appendChild(btn);
        });

        // 結果エリアを隠す
        document.getElementById('result-area').classList.add('hidden');
    }

    selectAnswer(selectedIndex) {
        const question = this.currentQuestions[this.currentIndex];
        const isCorrect = selectedIndex === question.answer;

        // 回答を記録
        this.answers.push({
            question: question,
            selected: selectedIndex,
            correct: isCorrect
        });

        if (isCorrect) {
            this.score++;
        }

        // 選択肢のスタイルを更新
        const buttons = document.querySelectorAll('.choice-btn');
        buttons.forEach((btn, index) => {
            btn.classList.add('disabled');
            if (index === question.answer) {
                btn.classList.add('correct');
            } else if (index === selectedIndex && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });

        // 結果を表示
        const resultArea = document.getElementById('result-area');
        const resultMessage = document.getElementById('result-message');
        const explanation = document.getElementById('explanation');

        resultMessage.textContent = isCorrect ? '正解!' : '不正解...';
        resultMessage.className = `result-message ${isCorrect ? 'correct' : 'incorrect'}`;
        explanation.textContent = question.explanation;

        // ボタンのテキストを更新
        const nextBtn = document.getElementById('btn-next');
        if (this.currentIndex >= this.currentQuestions.length - 1) {
            nextBtn.textContent = '結果を見る';
        } else {
            nextBtn.textContent = '次の問題へ';
        }

        resultArea.classList.remove('hidden');
    }

    nextQuestion() {
        this.currentIndex++;

        if (this.currentIndex >= this.currentQuestions.length) {
            this.showResults();
        } else {
            this.showQuestion();
        }
    }

    showResults() {
        this.showScreen('result-screen');

        const total = this.currentQuestions.length;
        const percent = Math.round((this.score / total) * 100);

        document.getElementById('score-percent').textContent = percent;
        document.getElementById('correct-count').textContent = this.score;
        document.getElementById('total-count').textContent = total;

        // カテゴリ別スコアを計算
        this.showCategoryScores();

        // 進捗バーを100%に
        document.getElementById('progress').style.width = '100%';

        // ローカルストレージにデータを保存
        this.saveResults();
    }

    // 結果をローカルストレージに保存
    saveResults() {
        const today = new Date().toISOString().split('T')[0];

        // 学習履歴を追加
        this.storageData.history.push({
            date: today,
            correct: this.score,
            total: this.currentQuestions.length,
            isReview: this.isReviewMode
        });

        // 間違えた問題を更新
        this.answers.forEach(answer => {
            const qId = answer.question.id;
            const idx = this.storageData.wrongQuestions.indexOf(qId);

            if (answer.correct) {
                // 正解した場合、復習リストから削除
                if (idx !== -1) {
                    this.storageData.wrongQuestions.splice(idx, 1);
                }
            } else {
                // 間違えた場合、復習リストに追加（重複しない）
                if (idx === -1) {
                    this.storageData.wrongQuestions.push(qId);
                }
            }

            // カテゴリ別統計を更新
            const cat = answer.question.category;
            if (!this.storageData.categoryStats[cat]) {
                this.storageData.categoryStats[cat] = { correct: 0, total: 0 };
            }
            this.storageData.categoryStats[cat].total++;
            if (answer.correct) {
                this.storageData.categoryStats[cat].correct++;
            }
        });

        this.saveStorageData();
    }

    showCategoryScores() {
        const categoryStats = {};

        this.answers.forEach(answer => {
            const category = answer.question.category;
            if (!categoryStats[category]) {
                categoryStats[category] = { correct: 0, total: 0 };
            }
            categoryStats[category].total++;
            if (answer.correct) {
                categoryStats[category].correct++;
            }
        });

        const container = document.getElementById('category-scores');
        container.innerHTML = '<h3 style="margin-bottom: 15px;">カテゴリ別成績</h3>';

        Object.keys(categoryStats).sort().forEach(category => {
            const stats = categoryStats[category];
            const percent = Math.round((stats.correct / stats.total) * 100);

            const item = document.createElement('div');
            item.className = 'category-score-item';
            item.innerHTML = `
                <span style="width: 150px;">${category}</span>
                <div class="category-score-bar">
                    <div class="category-score-fill" style="width: ${percent}%"></div>
                </div>
                <span style="width: 80px; text-align: right;">${stats.correct}/${stats.total} (${percent}%)</span>
            `;
            container.appendChild(item);
        });
    }

    retryQuiz() {
        this.startQuiz(this.isRandom);
    }

    goHome() {
        this.showScreen('start-screen');
        this.updateQuestionCount();
        this.updateStatsDisplay();
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        document.getElementById(screenId).classList.remove('hidden');
    }
}

// アプリケーション起動
document.addEventListener('DOMContentLoaded', () => {
    new QuizApp();
});
