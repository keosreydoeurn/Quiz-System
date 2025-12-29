document.addEventListener("DOMContentLoaded", () => {
    const latestResult = JSON.parse(localStorage.getItem("latestResult"));

    // Safety check
    if (!latestResult) {
        document.getElementById("percentage").textContent = "0%";
        document.getElementById("correctAnswers").textContent = "0/0";
        document.getElementById("scoreText").textContent = "No Quiz Taken Yet";
        return;
    }

    const { score, total, percentage } = latestResult;

    // Update UI
    document.getElementById("percentage").textContent = percentage + "%";
    document.getElementById("correctAnswers").textContent = `${score}/${total}`;

    // Dynamic message
    const scoreText = document.getElementById("scoreText");

    if (percentage >= 80) {
        scoreText.textContent = "Excellent Work! 🎉";
    } else if (percentage >= 60) {
        scoreText.textContent = "Good Job! 👍";
    } else if (percentage >= 40) {
        scoreText.textContent = "Not Bad 🙂";
    } else {
        scoreText.textContent = "Keep Practicing 💪";
    }
});
