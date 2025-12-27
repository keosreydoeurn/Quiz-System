function selectOption(option) {
    const reviewMode = localStorage.getItem('reviewMode');
    if (reviewMode === 'true') return; // Prevent changing in review mode

    const allOptions = option.parentElement.querySelectorAll('.option');
    allOptions.forEach(opt => opt.classList.remove('selected'));
    option.classList.add('selected');

    option.querySelector('input[type="radio"]').checked = true;
}

function submitQuiz() {
    const correctAnswers = {
        q1: "a",
        q2: "c",
        q3: "b",
        q4: "b",
        q5: "b",
        q6: "b",
        q7: "c",
        q8: "a",
        q9: "b",
        q10: "b"
    };

    let score = 0;
    let total = Object.keys(correctAnswers).length;
    const userAnswers = {};

    for (let q in correctAnswers) {
        const selected = document.querySelector(`input[name="${q}"]:checked`);
        if (!selected) continue;

        userAnswers[q] = selected.value;

        if (selected.value === correctAnswers[q]) score++;

        // Enable show answer button
        const quizDiv = selected.closest(".quiz-question");
        const showBtn = quizDiv.querySelector(".show-answer-btn");
        showBtn.disabled = false;
        showBtn.onclick = () => {
            quizDiv.querySelector(".answer-explanation").style.display = "block";
        };
    }

    const percentage = Math.round((score / total) * 100);
    const resultData = {
        score,
        total,
        percentage,
        date: new Date().toLocaleString(),
        userAnswers,
        correctAnswers
    };

    localStorage.setItem("latestResult", JSON.stringify(resultData));

    let history = JSON.parse(localStorage.getItem("quizHistory")) || [];
    history.push(resultData);
    localStorage.setItem("quizHistory", JSON.stringify(history));

    window.location.href = "result.html";
}

// ================= REVIEW MODE =================
window.addEventListener('DOMContentLoaded', () => {
    const reviewMode = localStorage.getItem('reviewMode');

    if (reviewMode === 'true') {
        const latestResult = JSON.parse(localStorage.getItem('latestResult'));
        if (!latestResult) return;

        const userAnswers = latestResult.userAnswers;
        const correctAnswers = latestResult.correctAnswers;

        for (let q in userAnswers) {
            const userValue = userAnswers[q];
            const userInput = document.querySelector(`input[name="${q}"][value="${userValue}"]`);
            const quizDiv = userInput.closest(".quiz-question");

            // Highlight selected answer
            userInput.checked = true;
            userInput.parentElement.classList.add('selected');

            // Color coding
            if (userValue === correctAnswers[q]) {
                userInput.parentElement.style.border = "2px solid blue"; // correct
            } else {
                userInput.parentElement.style.border = "2px solid red"; // wrong
            }

            // Enable show answer button
            const showBtn = quizDiv.querySelector(".show-answer-btn");
            showBtn.disabled = false;
            showBtn.onclick = () => {
                quizDiv.querySelector(".answer-explanation").style.display = "block";
            };
        }

        // Prevent changes in review mode
        const allOptions = document.querySelectorAll('.option input[type="radio"]');
        allOptions.forEach(input => input.disabled = true);

        // Add back button to result
        const container = document.querySelector('.quiz-container');
        const backBtn = document.createElement('button');
        backBtn.textContent = "Back to Result";
        backBtn.className = "btn btn-outline";
        backBtn.onclick = () => {
            window.location.href = "result.html";
        };
        container.prepend(backBtn);

        localStorage.removeItem('reviewMode'); // Clear flag
    }
});
