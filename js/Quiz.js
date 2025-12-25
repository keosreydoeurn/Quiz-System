function selectOption(option) {
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

    for (let q in correctAnswers) {
        const selected = document.querySelector(`input[name="${q}"]:checked`);
        const options = document.querySelectorAll(`input[name="${q}"]`);

        options.forEach(opt => opt.parentElement.style.border = "none");

        if (!selected) continue;

        if (selected.value === correctAnswers[q]) {
            selected.parentElement.style.border = "2px solid green";
            score++;
        } else {
            selected.parentElement.style.border = "2px solid red";
        }

        const quizDiv = selected.closest(".quiz-question");
        const showBtn = quizDiv.querySelector(".show-answer-btn");
        showBtn.disabled = false;

        showBtn.onclick = () => {
            quizDiv.querySelector(".answer-explanation").style.display = "block";
        };
    }

    // ✅ KEEP DATA (HISTORY)
    const percentage = Math.round((score / total) * 100);

    const resultData = {
        score: score,
        total: total,
        percentage: percentage,
        date: new Date().toLocaleString()
    };

    // Get existing history or create new
    let history = JSON.parse(localStorage.getItem("quizHistory")) || [];

    // Add new result
    history.push(resultData);

    // Save history
    localStorage.setItem("quizHistory", JSON.stringify(history));

    // Save latest result (for result page)
    localStorage.setItem("latestResult", JSON.stringify(resultData));
}

function goToResult() {
    window.location.href = "result.html";
}
