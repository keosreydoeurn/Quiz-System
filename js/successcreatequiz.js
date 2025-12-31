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
    if (q.type === 'truefalse') {
        optionsHTML = `
            <label class="option"><input type="radio" name="q-${qIndex}" value="0"> True</label>
            <label class="option"><input type="radio" name="q-${qIndex}" value="1"> False</label>
        `;
    } else {
        q.options.forEach((opt, optIndex) => {
            optionsHTML += `<label class="option"><input type="radio" name="q-${qIndex}" value="${optIndex}"> ${opt}</label>`;
        });
    }

    div.innerHTML = `
        <h4>Question ${qIndex + 1}</h4>
        <p>${q.question}</p>
        ${optionsHTML}
    `;

    questionsArea.appendChild(div);
});

document.getElementById('quizForm').addEventListener('submit', function(e) {
    e.preventDefault();
    showResults();
});

function showResults() {
    quiz.questions.forEach((q, qIndex) => {
        const questionDiv = questionsArea.children[qIndex];
        const options = questionDiv.querySelectorAll('.option');
        let selected = -1;

        options.forEach((opt, idx) => {
            const radio = opt.querySelector('input[type="radio"]');
            if (radio.checked) selected = parseInt(radio.value);
            opt.classList.remove('correct', 'wrong');
        });

        options.forEach((opt, idx) => {
            if (idx === q.correctAnswer) opt.classList.add('correct');
        });

        if (selected !== -1 && selected !== q.correctAnswer) {
            options[selected].classList.add('wrong');
        }
    });

    // alert('Results shown! Green = correct, Red = wrong.');
}