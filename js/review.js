(function () {
    const params = new URLSearchParams(window.location.search);
    const userParam = params.get('user');
    const quizTitleEl = document.getElementById('quizTitle');
    const quizCategoryEl = document.getElementById('quizCategory');
    const quizLevelEl = document.getElementById('quizLevel');
    const questionsArea = document.getElementById('questionsArea');

    function renderNoData(message) {
        quizTitleEl.textContent = 'No data';
        quizCategoryEl.textContent = '';
        quizLevelEl.textContent = '';
        questionsArea.innerHTML = `<p>${message}</p>`;
    }

    function renderUserHistory(user) {
        // Try per-user key first
        const key = `quizHistory_${user}`;
        let hist = [];
        try {
            hist = JSON.parse(localStorage.getItem(key) || '[]');
        } catch (e) {
            hist = [];
        }

        // If not found, search generic quizHistory entries for matching userName
        if (!hist || hist.length === 0) {
            try {
                const guest = JSON.parse(localStorage.getItem('quizHistory') || '[]');
                hist = guest.filter(r => (r.userName || '').toLowerCase() === user.toLowerCase());
            } catch (e) {
                hist = [];
            }
        }

        if (!hist || hist.length === 0) {
            renderNoData(`No results found for ${user}`);
            return;
        }

        // Show a simple summary list of recent results
        quizTitleEl.textContent = `Results for ${user}`;
        quizCategoryEl.textContent = `${hist.length} attempt(s)`;
        quizLevelEl.textContent = hist[hist.length - 1].date || '';

        questionsArea.innerHTML = '';
        hist.slice().reverse().forEach((r, idx) => {
            const div = document.createElement('div');
            div.className = 'result-row';
            div.innerHTML = `
                <h4>#${idx + 1} — ${r.quizTitle || r.title || 'Quiz'}</h4>
                <p>Score: ${r.percentage ?? r.score ?? '-'}%</p>
                <p>Date: ${r.date || '-'}</p>
            `;
            questionsArea.appendChild(div);
        });
    }

    function renderPreviewQuiz() {
        const quizzes = JSON.parse(localStorage.getItem('userQuizzes') || '[]');
        if (!quizzes || quizzes.length === 0) {
            renderNoData('No preview quiz found');
            return;
        }

        const quiz = quizzes[quizzes.length - 1];
        quizTitleEl.textContent = quiz.title || 'Untitled';
        quizCategoryEl.textContent = quiz.category || '';
        quizLevelEl.textContent = quiz.level || '';

        questionsArea.innerHTML = '';
        (quiz.questions || []).forEach((q, qIndex) => {
            const div = document.createElement('div');
            div.className = 'question-box';

            let optionsHTML = '';
            (q.options || []).forEach((opt, optIndex) => {
                optionsHTML += `
                    <label class="option">
                        <input type="radio" name="q-${qIndex}" value="${optIndex}">
                        ${opt}
                    </label>
                `;
            });

            div.innerHTML = `
                <h4>Question ${qIndex + 1}</h4>
                <p>${q.question}</p>
                ${optionsHTML}
            `;

            // Handle selection preview
            div.querySelectorAll('input[type="radio"]').forEach(radio => {
                radio.addEventListener('change', () => {
                    const options = div.querySelectorAll('.option');
                    options.forEach(opt => opt.classList.remove('correct', 'wrong'));

                    const selected = radio.closest('.option');
                    if (parseInt(radio.value) === q.correctAnswer) {
                        selected.classList.add('correct');
                    } else {
                        selected.classList.add('wrong');
                        if (options[q.correctAnswer]) options[q.correctAnswer].classList.add('correct');
                    }
                });
            });

            questionsArea.appendChild(div);
        });
    }

    window.confirmQuiz = function () {
        window.location.href = 'successcreatequiz.html';
    };

    if (userParam) {
        renderUserHistory(userParam);
    } else {
        renderPreviewQuiz();
    }

})();