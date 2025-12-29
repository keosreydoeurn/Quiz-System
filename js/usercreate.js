document.addEventListener('DOMContentLoaded', function () {
    const questionsContainer = document.getElementById('questionsContainer');
    const addQuestionBtn = document.getElementById('addQuestionBtn');
    const quizForm = document.getElementById('quizForm');
    let questionCount = 0;

    // Add first question
    addQuestion();

    // Add question button
    addQuestionBtn.addEventListener('click', addQuestion);

    // Form submit
    quizForm.addEventListener('submit', function (e) {
        e.preventDefault();
        saveQuiz();
    });

    function addQuestion() {
        questionCount++;
        const questionId = `question-${questionCount}`;

        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-container';
        questionDiv.id = questionId;

        questionDiv.innerHTML = `
        <div class="form-group">
            <label>Question ${questionCount}</label>
            <input type="text" class="form-control question-text" placeholder="Enter your question" required>
        </div>
        <div class="form-group">
            <label>Question Type</label>
            <select class="form-control question-type">
                <option value="mcq">Multiple Choice</option>
                <option value="truefalse">True / False</option>
            </select>
        </div>
        <div class="form-group options-section">
            <label>Options</label>
            <div class="options-container">
                <div class="option-row">
                    <input type="radio" name="correct-${questionId}" value="0" required>
                    <input type="text" class="form-control option-input" placeholder="Option 1" required>
                </div>
                <div class="option-row">
                    <input type="radio" name="correct-${questionId}" value="1" required>
                    <input type="text" class="form-control option-input" placeholder="Option 2" required>
                </div>
            </div>
            <button type="button" class="add-option" data-question="${questionId}">Add Option</button>
        </div>
        <button type="button" class="remove-question" data-question="${questionId}">Remove Question</button>
        `;

        questionsContainer.appendChild(questionDiv);

        const addOptionBtn = questionDiv.querySelector('.add-option');
        addOptionBtn.addEventListener('click', addOption);

        const removeBtn = questionDiv.querySelector('.remove-question');
        removeBtn.addEventListener('click', () => {
            if (questionCount > 1) {
                questionsContainer.removeChild(questionDiv);
                questionCount--;
                updateQuestionNumbers();
            } else {
                alert('A quiz must have at least one question');
            }
        });

        const typeSelect = questionDiv.querySelector('.question-type');
        const optionsSection = questionDiv.querySelector('.options-section');
        typeSelect.addEventListener('change', () => {
            if (typeSelect.value === 'truefalse') {
                optionsSection.innerHTML = `
                <label>Answer</label>
                <div class="option-row">
                    <input type="radio" name="correct-${questionId}" value="0" required> True
                </div>
                <div class="option-row">
                    <input type="radio" name="correct-${questionId}" value="1" required> False
                </div>`;
            } else {
                optionsSection.innerHTML = `
                <label>Options</label>
                <div class="options-container">
                    <div class="option-row">
                        <input type="radio" name="correct-${questionId}" value="0" required>
                        <input type="text" class="form-control option-input" placeholder="Option 1" required>
                    </div>
                    <div class="option-row">
                        <input type="radio" name="correct-${questionId}" value="1" required>
                        <input type="text" class="form-control option-input" placeholder="Option 2" required>
                    </div>
                </div>
                <button type="button" class="add-option" data-question="${questionId}">Add Option</button>`;
                questionDiv.querySelector('.add-option').addEventListener('click', addOption);
            }
        });
    }

    function addOption(e) {
        const questionId = e.target.getAttribute('data-question');
        const questionDiv = document.getElementById(questionId);
        const optionsContainer = questionDiv.querySelector('.options-container');
        const optionCount = optionsContainer.children.length;

        if (optionCount >= 5) {
            alert('Maximum 5 options allowed per question');
            return;
        }

        const optionRow = document.createElement('div');
        optionRow.className = 'option-row';
        optionRow.innerHTML = `
        <input type="radio" name="correct-${questionId}" value="${optionCount}" required>
        <input type="text" class="form-control option-input" placeholder="Option ${optionCount + 1}" required>
        `;
        optionsContainer.appendChild(optionRow);
    }

    function updateQuestionNumbers() {
        const questions = questionsContainer.querySelectorAll('.question-container');
        questions.forEach((q, i) => {
            const label = q.querySelector('label');
            if (label) label.textContent = `Question ${i + 1}`;
        });
    }

    function saveQuiz() {
        const quizData = {
            title: document.getElementById('quizTitle').value,
            category: document.getElementById('quizCategory').value,
            level: document.getElementById('quizLevel').value,
            questions: []
        };

        const questionDivs = questionsContainer.querySelectorAll('.question-container');

        for (const questionDiv of questionDivs) {
            const questionText = questionDiv.querySelector('.question-text').value;
            const type = questionDiv.querySelector('.question-type').value;
            const options = [];
            let correctAnswer = -1;

            if (type === 'truefalse') {
                options.push('True', 'False');
            } else {
                const optionInputs = questionDiv.querySelectorAll('.option-input');
                optionInputs.forEach((input) => {
                    if (!input.value.trim()) {
                        alert('Please fill all option texts');
                        return;
                    }
                    options.push(input.value);
                });
            }

            const radios = questionDiv.querySelectorAll('input[type="radio"]');
            radios.forEach(r => {
                if (r.checked) correctAnswer = parseInt(r.value);
            });

            if (correctAnswer === -1) {
                alert('Please select correct answer for each question');
                return;
            }

            quizData.questions.push({ question: questionText, type, options, correctAnswer });
        }

        // Save to localStorage
        const quizzes = JSON.parse(localStorage.getItem('userQuizzes') || '[]');
        quizzes.push(quizData);
        localStorage.setItem('userQuizzes', JSON.stringify(quizzes));

        alert('Quiz saved successfully!');
        window.location.href = 'review.html';
    }
});
