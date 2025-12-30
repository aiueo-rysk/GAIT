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

        // 模擬試験モード用
        this.isExamMode = false;
        this.examType = null; // 'gait2' or 'egait2'
        this.examConfig = {
            gait2: { questions: 160, timeMinutes: 60, maxScore: 990 },
            egait2: { questions: 80, timeMinutes: 30, maxScore: 300 }
        };
        this.timerInterval = null;
        this.remainingSeconds = 0;

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
            // examHistoryがない場合は追加
            if (!this.storageData.examHistory) {
                this.storageData.examHistory = [];
            }
            // bookmarksがない場合は追加
            if (!this.storageData.bookmarks) {
                this.storageData.bookmarks = [];
            }
        } else {
            this.storageData = {
                history: [],
                wrongQuestions: [],
                categoryStats: {},
                examHistory: [],
                bookmarks: []
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

        // お気に入りボタンの状態を更新
        const bookmarkCount = this.storageData.bookmarks.length;
        const bookmarkBtn = document.getElementById('btn-bookmark-quiz');
        if (bookmarkBtn) {
            bookmarkBtn.disabled = bookmarkCount === 0;
            bookmarkBtn.textContent = bookmarkCount > 0 ? `お気に入りから出題 (${bookmarkCount}問)` : 'お気に入りから出題';
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
        document.getElementById('btn-back').addEventListener('click', () => this.confirmExit());
        document.getElementById('btn-clear-data').addEventListener('click', () => this.clearData());
        document.getElementById('category-select').addEventListener('change', () => this.updateQuestionCount());

        // 模擬試験モード用
        document.getElementById('btn-mock-exam').addEventListener('click', () => this.showExamSelect());
        document.getElementById('btn-exam-back').addEventListener('click', () => this.goHome());
        document.getElementById('btn-start-gait2').addEventListener('click', () => this.startExam('gait2'));
        document.getElementById('btn-start-egait2').addEventListener('click', () => this.startExam('egait2'));

        // ダッシュボード用
        document.getElementById('btn-dashboard').addEventListener('click', () => this.showDashboard());
        document.getElementById('btn-dashboard-back').addEventListener('click', () => this.goHome());

        // お気に入り用
        document.getElementById('btn-bookmark').addEventListener('click', () => this.toggleBookmark());
        document.getElementById('btn-bookmark-quiz').addEventListener('click', () => this.startBookmarkQuiz());
    }

    // お気に入りをトグル
    toggleBookmark() {
        const question = this.currentQuestions[this.currentIndex];
        const qId = question.id;
        const idx = this.storageData.bookmarks.indexOf(qId);

        if (idx === -1) {
            this.storageData.bookmarks.push(qId);
        } else {
            this.storageData.bookmarks.splice(idx, 1);
        }

        this.saveStorageData();
        this.updateBookmarkButton();
    }

    // ブックマークボタンの表示を更新
    updateBookmarkButton() {
        const question = this.currentQuestions[this.currentIndex];
        const btn = document.getElementById('btn-bookmark');
        const isBookmarked = this.storageData.bookmarks.includes(question.id);

        btn.textContent = isBookmarked ? '★' : '☆';
        btn.classList.toggle('active', isBookmarked);
    }

    // お気に入りから出題
    startBookmarkQuiz() {
        const bookmarkIds = this.storageData.bookmarks;
        if (bookmarkIds.length === 0) {
            alert('お気に入りの問題がありません');
            return;
        }

        this.currentQuestions = this.questions.filter(q => bookmarkIds.includes(q.id));
        this.currentQuestions = this.shuffleArray(this.currentQuestions);
        this.isRandom = true;
        this.isReviewMode = false;
        this.isExamMode = false;
        this.currentIndex = 0;
        this.score = 0;
        this.answers = [];

        this.showScreen('quiz-screen');
        this.showQuestion();
    }

    // ダッシュボード表示
    showDashboard() {
        this.showScreen('dashboard-screen');
        this.renderDashboard();
    }

    // ダッシュボード描画
    renderDashboard() {
        this.renderDashboardStats();
        this.renderHistoryChart();
        this.renderCategoryAnalysis();
        this.renderExamHistory();
    }

    // 総合統計を描画
    renderDashboardStats() {
        const container = document.getElementById('dashboard-stats');
        const history = this.storageData.history;

        // 総学習回数
        const totalSessions = history.length;

        // 総回答数
        let totalQuestions = 0;
        let totalCorrect = 0;
        history.forEach(h => {
            totalQuestions += h.total;
            totalCorrect += h.correct;
        });

        // 総合正答率
        const overallRate = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

        // 学習日数（ユニークな日付数）
        const uniqueDays = new Set(history.map(h => h.date)).size;

        // 連続学習日数を計算
        const streak = this.calculateStreak();

        // 復習待ち問題数
        const wrongCount = this.storageData.wrongQuestions.length;

        container.innerHTML = `
            <div class="dashboard-stat-card">
                <span class="dashboard-stat-value">${totalSessions}</span>
                <span class="dashboard-stat-label">総学習回数</span>
            </div>
            <div class="dashboard-stat-card">
                <span class="dashboard-stat-value">${totalQuestions}</span>
                <span class="dashboard-stat-label">総回答数</span>
            </div>
            <div class="dashboard-stat-card">
                <span class="dashboard-stat-value">${overallRate}%</span>
                <span class="dashboard-stat-label">総合正答率</span>
            </div>
            <div class="dashboard-stat-card">
                <span class="dashboard-stat-value">${uniqueDays}</span>
                <span class="dashboard-stat-label">学習日数</span>
            </div>
            <div class="dashboard-stat-card highlight">
                <span class="dashboard-stat-value">${streak}</span>
                <span class="dashboard-stat-label">連続学習日数</span>
            </div>
            <div class="dashboard-stat-card ${wrongCount > 0 ? 'warning' : ''}">
                <span class="dashboard-stat-value">${wrongCount}</span>
                <span class="dashboard-stat-label">復習待ち</span>
            </div>
        `;
    }

    // 連続学習日数を計算
    calculateStreak() {
        const history = this.storageData.history;
        if (history.length === 0) return 0;

        const dates = [...new Set(history.map(h => h.date))].sort().reverse();
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        // 今日または昨日に学習していない場合は0
        if (dates[0] !== today && dates[0] !== yesterday) return 0;

        let streak = 1;
        let currentDate = new Date(dates[0]);

        for (let i = 1; i < dates.length; i++) {
            const prevDate = new Date(currentDate);
            prevDate.setDate(prevDate.getDate() - 1);
            const expectedDate = prevDate.toISOString().split('T')[0];

            if (dates[i] === expectedDate) {
                streak++;
                currentDate = prevDate;
            } else {
                break;
            }
        }

        return streak;
    }

    // 学習履歴グラフを描画
    renderHistoryChart() {
        const container = document.getElementById('history-chart');
        const history = this.storageData.history;

        // 直近7日間のデータを集計
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(Date.now() - i * 86400000);
            const dateStr = date.toISOString().split('T')[0];
            const dayName = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];

            const dayData = history.filter(h => h.date === dateStr);
            const questions = dayData.reduce((sum, h) => sum + h.total, 0);
            const correct = dayData.reduce((sum, h) => sum + h.correct, 0);

            days.push({
                date: dateStr,
                dayName: dayName,
                questions: questions,
                correct: correct,
                rate: questions > 0 ? Math.round((correct / questions) * 100) : 0
            });
        }

        const maxQuestions = Math.max(...days.map(d => d.questions), 1);

        container.innerHTML = `
            <div class="chart-container">
                ${days.map(day => `
                    <div class="chart-bar-wrapper">
                        <div class="chart-bar" style="height: ${(day.questions / maxQuestions) * 100}%">
                            <span class="chart-value">${day.questions > 0 ? day.questions : ''}</span>
                        </div>
                        <span class="chart-label">${day.dayName}</span>
                    </div>
                `).join('')}
            </div>
            <div class="chart-legend">
                <span>回答数（直近7日間）</span>
            </div>
        `;
    }

    // カテゴリ別分析を描画
    renderCategoryAnalysis() {
        const container = document.getElementById('category-analysis');
        const stats = this.storageData.categoryStats;
        const categories = Object.keys(stats);

        if (categories.length === 0) {
            container.innerHTML = '<p class="no-data">まだデータがありません</p>';
            return;
        }

        // 正答率でソート
        const sorted = categories
            .map(cat => ({
                name: cat,
                correct: stats[cat].correct,
                total: stats[cat].total,
                rate: Math.round((stats[cat].correct / stats[cat].total) * 100)
            }))
            .sort((a, b) => b.rate - a.rate);

        container.innerHTML = sorted.map(cat => {
            let status = '';
            let statusClass = '';
            if (cat.rate >= 80) { status = '習得済み'; statusClass = 'mastered'; }
            else if (cat.rate >= 60) { status = '学習中'; statusClass = 'learning'; }
            else { status = '要強化'; statusClass = 'weak'; }

            return `
                <div class="category-analysis-item">
                    <div class="category-info">
                        <span class="category-name">${cat.name}</span>
                        <span class="category-status ${statusClass}">${status}</span>
                    </div>
                    <div class="category-progress">
                        <div class="category-bar-container">
                            <div class="category-bar-fill ${statusClass}" style="width: ${cat.rate}%"></div>
                        </div>
                        <span class="category-rate">${cat.rate}%</span>
                    </div>
                    <div class="category-detail">
                        ${cat.correct}/${cat.total}問正解
                    </div>
                </div>
            `;
        }).join('');
    }

    // 模擬試験履歴を描画
    renderExamHistory() {
        const container = document.getElementById('exam-history');
        const history = this.storageData.examHistory || [];

        if (history.length === 0) {
            container.innerHTML = '<p class="no-data">まだ模擬試験を受けていません</p>';
            return;
        }

        container.innerHTML = history.slice(-5).reverse().map(exam => {
            const config = this.examConfig[exam.type];
            const typeName = exam.type === 'gait2' ? 'GAIT2.0' : 'e-GAIT2.0';

            return `
                <div class="exam-history-item">
                    <div class="exam-history-info">
                        <span class="exam-type">${typeName}</span>
                        <span class="exam-date">${exam.date}</span>
                    </div>
                    <div class="exam-history-score">
                        <span class="exam-score">${exam.score}点</span>
                        <span class="exam-rank ${exam.rank.toLowerCase()}">${exam.rank}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 終了確認
    confirmExit() {
        if (this.isExamMode) {
            if (confirm('模擬試験を中断しますか？\n進捗は保存されません。')) {
                this.stopTimer();
                this.goHome();
            }
        } else {
            this.goHome();
        }
    }

    // 模擬試験選択画面を表示
    showExamSelect() {
        this.showScreen('exam-select-screen');
    }

    // 模擬試験を開始
    startExam(examType) {
        this.examType = examType;
        this.isExamMode = true;
        this.isReviewMode = false;

        const config = this.examConfig[examType];
        const requiredQuestions = config.questions;

        // 問題を準備（足りない場合は繰り返し）
        let examQuestions = this.shuffleArray([...this.questions]);
        while (examQuestions.length < requiredQuestions) {
            examQuestions = examQuestions.concat(this.shuffleArray([...this.questions]));
        }
        this.currentQuestions = examQuestions.slice(0, requiredQuestions);

        this.currentIndex = 0;
        this.score = 0;
        this.answers = [];

        // タイマー設定
        this.remainingSeconds = config.timeMinutes * 60;

        this.showScreen('quiz-screen');
        this.showQuestion();
        this.startTimer();
    }

    // タイマー開始
    startTimer() {
        const timerDisplay = document.getElementById('timer-display');
        timerDisplay.classList.remove('hidden');
        this.updateTimerDisplay();

        this.timerInterval = setInterval(() => {
            this.remainingSeconds--;
            this.updateTimerDisplay();

            if (this.remainingSeconds <= 0) {
                this.stopTimer();
                alert('時間切れです！');
                this.showResults();
            }
        }, 1000);
    }

    // タイマー停止
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        const timerDisplay = document.getElementById('timer-display');
        timerDisplay.classList.add('hidden');
    }

    // タイマー表示を更新
    updateTimerDisplay() {
        const minutes = Math.floor(this.remainingSeconds / 60);
        const seconds = this.remainingSeconds % 60;
        const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        const timerDisplay = document.getElementById('timer-display');
        timerDisplay.textContent = display;

        // 残り5分以下で警告色
        if (this.remainingSeconds <= 300) {
            timerDisplay.classList.add('warning');
        } else {
            timerDisplay.classList.remove('warning');
        }
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

        // お気に入りボタンを更新（模擬試験モードでは非表示）
        const bookmarkBtn = document.getElementById('btn-bookmark');
        if (this.isExamMode) {
            bookmarkBtn.classList.add('hidden');
        } else {
            bookmarkBtn.classList.remove('hidden');
            this.updateBookmarkButton();
        }
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

        // 模擬試験モードの場合は即座に次の問題へ
        if (this.isExamMode) {
            const buttons = document.querySelectorAll('.choice-btn');
            buttons.forEach(btn => btn.classList.add('disabled'));

            // 選択した選択肢をハイライト
            buttons[selectedIndex].classList.add('selected');

            // 少し遅延して次の問題へ
            setTimeout(() => {
                this.nextQuestion();
            }, 300);
            return;
        }

        // 通常モード：選択肢のスタイルを更新
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
        // 模擬試験モードの場合はタイマーを停止
        if (this.isExamMode) {
            this.stopTimer();
        }

        this.showScreen('result-screen');

        const total = this.currentQuestions.length;
        const percent = Math.round((this.score / total) * 100);

        document.getElementById('score-percent').textContent = percent;
        document.getElementById('correct-count').textContent = this.score;
        document.getElementById('total-count').textContent = total;

        // カテゴリ別スコアを計算
        this.showCategoryScores();

        // 模擬試験モードの場合はスコア換算を表示
        if (this.isExamMode) {
            this.showExamScore();
        }

        // 進捗バーを100%に
        document.getElementById('progress').style.width = '100%';

        // ローカルストレージにデータを保存
        this.saveResults();
    }

    // 模擬試験のスコアを表示
    showExamScore() {
        const config = this.examConfig[this.examType];
        const total = this.currentQuestions.length;
        const estimatedScore = Math.round((this.score / total) * config.maxScore);

        // スコアランク判定
        let rank = '';
        let rankClass = '';
        if (this.examType === 'gait2') {
            if (estimatedScore >= 800) { rank = 'Gold'; rankClass = 'gold'; }
            else if (estimatedScore >= 600) { rank = 'Silver'; rankClass = 'silver'; }
            else if (estimatedScore >= 400) { rank = 'Bronze'; rankClass = 'bronze'; }
            else { rank = '-'; rankClass = ''; }
        } else {
            if (estimatedScore >= 240) { rank = 'Gold'; rankClass = 'gold'; }
            else if (estimatedScore >= 180) { rank = 'Silver'; rankClass = 'silver'; }
            else if (estimatedScore >= 120) { rank = 'Bronze'; rankClass = 'bronze'; }
            else { rank = '-'; rankClass = ''; }
        }

        // 模擬試験履歴に保存
        const today = new Date().toISOString().split('T')[0];
        this.storageData.examHistory.push({
            date: today,
            type: this.examType,
            score: estimatedScore,
            rank: rank,
            correct: this.score,
            total: total
        });
        this.saveStorageData();

        const examTypeName = this.examType === 'gait2' ? 'GAIT2.0' : 'e-GAIT2.0';

        const examScoreHtml = `
            <div class="exam-result-section">
                <h3>${examTypeName} 模擬試験結果</h3>
                <div class="exam-score-display">
                    <div class="estimated-score">
                        <span class="score-value">${estimatedScore}</span>
                        <span class="score-max">/ ${config.maxScore}点</span>
                    </div>
                    <div class="rank-display ${rankClass}">
                        <span class="rank-label">ランク:</span>
                        <span class="rank-value">${rank}</span>
                    </div>
                </div>
                <p class="exam-note">※ 実際の試験とは採点方式が異なる場合があります</p>
            </div>
        `;

        const container = document.getElementById('category-scores');
        container.insertAdjacentHTML('beforebegin', examScoreHtml);
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
        // 模擬試験結果セクションを削除
        const examResultSection = document.querySelector('.exam-result-section');
        if (examResultSection) {
            examResultSection.remove();
        }

        if (this.isExamMode) {
            this.startExam(this.examType);
        } else {
            this.startQuiz(this.isRandom);
        }
    }

    goHome() {
        // 模擬試験モードをリセット
        this.isExamMode = false;
        this.examType = null;
        this.stopTimer();

        // 模擬試験結果セクションを削除
        const examResultSection = document.querySelector('.exam-result-section');
        if (examResultSection) {
            examResultSection.remove();
        }

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
