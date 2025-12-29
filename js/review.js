const quizzes = JSON.parse(localStorage.getItem('userQuizzes') || '[]');
    const quiz = quizzes[quizzes.length - 1];

    document.getElementById('quizTitle').textContent = quiz.title;
    document.getElementById('quizCategory').textContent = quiz.category;
    document.getElementById('quizLevel').textContent = quiz.level;

    const questionsArea = document.getElementById('questionsArea');

    quiz.questions.forEach((q, qIndex) => {
        const div = document.createElement('div');
        div.className = 'question-box';

        let optionsHTML = '';
        q.options.forEach((opt, optIndex) => {
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
                    options[q.correctAnswer].classList.add('correct');
                }
            });
        });

        questionsArea.appendChild(div);
    });

    function confirmQuiz() {
        // alert('Quiz confirmed and ready to use!');
        window.location.href = 'finshi.html';
    }15