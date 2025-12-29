document.addEventListener("DOMContentLoaded", () => {
    const latestResult = JSON.parse(localStorage.getItem("latestResult"));

    // UI elements
    const percentageElem = document.getElementById("percentage");
    const correctAnswersElem = document.getElementById("correctAnswers");
    const scoreTextElem = document.getElementById("scoreText");
    const attemptDateElem = document.getElementById("attemptDate");

    // If no quiz has been taken
    if (!latestResult) {
        if (percentageElem) percentageElem.textContent = "0%";
        if (correctAnswersElem) correctAnswersElem.textContent = "0/0";
        if (scoreTextElem) scoreTextElem.textContent = "No Quiz Taken Yet";
        if (attemptDateElem) attemptDateElem.textContent = "-";
        return;
    }

    const { score, total, percentage, date } = latestResult;

    // Update UI
    if (percentageElem) percentageElem.textContent = `${percentage}%`;
    if (correctAnswersElem) correctAnswersElem.textContent = `${score}/${total}`;
    if (attemptDateElem) attemptDateElem.textContent = date || "-";

    // Dynamic score message
    if (scoreTextElem) {
        if (percentage >= 80) {
            scoreTextElem.textContent = "Excellent Work! 🎉";
        } else if (percentage >= 60) {
            scoreTextElem.textContent = "Good Job! 👍";
        } else if (percentage >= 40) {
            scoreTextElem.textContent = "Not Bad 🙂";
        } else {
            scoreTextElem.textContent = "Keep Practicing 💪";
        }
    }

    const reviewBtn = document.getElementById("reviewBtn");
    if (reviewBtn) {
        reviewBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const latestResult = JSON.parse(localStorage.getItem("latestResult"));
            if (!latestResult || !latestResult.quizPage) return;

            localStorage.setItem("reviewMode", "true");
            window.location.href = latestResult.quizPage;
        });
    }

});
