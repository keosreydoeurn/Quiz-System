// ================= RESULT.JS =================

// Get the latest result from localStorage
const latestResult = JSON.parse(localStorage.getItem("latestResult"));

if (latestResult) {
    const score = latestResult.score;
    const total = latestResult.total;
    const percentage = latestResult.percentage;

    // ================= UPDATE UI =================
    document.getElementById("percentage").textContent = `${percentage}%`;
    document.getElementById("correctAnswers").textContent = `${score}/${total}`;

    // ================= SCORE TEXT MESSAGE =================
    const scoreText = document.getElementById("scoreText");

    if (percentage >= 90) {
        scoreText.textContent = "Excellent!";
    } else if (percentage >= 75) {
        scoreText.textContent = "Great Job!";
    } else if (percentage >= 50) {
        scoreText.textContent = "Good Try!";
    } else {
        scoreText.textContent = "Keep Practicing!";
    }

    // ================= CIRCLE COLOR =================
    const scoreCircle = document.querySelector(".score-circle");
    // Remove previous classes
    scoreCircle.classList.remove("high-score", "medium-score", "low-score");

    if (percentage >= 75) {
        scoreCircle.classList.add("high-score");
    } else if (percentage >= 50) {
        scoreCircle.classList.add("medium-score");
    } else {
        scoreCircle.classList.add("low-score");
    }

    // Optional: Update the date
    const resultDateElem = document.querySelector(".result-card .text-muted");
    if (resultDateElem && latestResult.date) {
        resultDateElem.textContent = `Completed on ${latestResult.date}`;
    }
}
