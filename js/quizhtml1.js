// ================= QUIZ TIMER =================
let totalTime = 10 * 60; // 10 minutes
let timerInterval;

window.addEventListener("DOMContentLoaded", () => {
    startTimer();
    handleReviewMode();
});

// Start countdown timer
function startTimer() {
    const timeDisplay = document.getElementById("time");
    if (!timeDisplay) return;

    // Make timer float near the form
    timeDisplay.style.position = "sticky";
    timeDisplay.style.top = "10px";
    timeDisplay.style.zIndex = "1000";
    timeDisplay.style.fontWeight = "700";

    timerInterval = setInterval(() => {
        const minutes = Math.floor(totalTime / 60);
        const seconds = totalTime % 60;
        timeDisplay.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
        totalTime--;

        if (totalTime < 0) {
            clearInterval(timerInterval);
            alert("⏰ Time is up! Quiz will be submitted.");
            submitQuiz();
        }
    }, 1000);
}

// ================= SELECT OPTION =================
function selectOption(option) {
    if (localStorage.getItem("reviewMode") === "true") return;

    const allOptions = option.parentElement.querySelectorAll(".option");
    allOptions.forEach(opt => opt.classList.remove("selected"));

    option.classList.add("selected");
    option.querySelector('input[type="radio"]').checked = true;
}

// ================= SUBMIT QUIZ =================
function submitQuiz() {
    clearInterval(timerInterval);

    const correctAnswers = {
        q1: "a", q2: "c", q3: "b", q4: "b", q5: "b",
        q6: "b", q7: "c", q8: "a", q9: "b", q10: "b"
    };

    let score = 0;
    const userAnswers = {};

    for (const q in correctAnswers) {
        const selected = document.querySelector(`input[name="${q}"]:checked`);
        if (!selected) continue;

        userAnswers[q] = selected.value;
        if (selected.value === correctAnswers[q]) score++;

        // Show answer button
        const quizDiv = selected.closest(".quiz-question");
        const showBtn = quizDiv.querySelector(".show-answer-btn");
        if (showBtn) showBtn.onclick = () => {
            const explanation = quizDiv.querySelector(".answer-explanation");
            explanation.style.display = explanation.style.display === 'block' ? 'none' : 'block';
        };
    }

    const total = Object.keys(correctAnswers).length;
    const percentage = Math.round((score / total) * 100);

    const resultData = {
        score,
        total,
        percentage,
        date: new Date().toLocaleString(),
        userAnswers,
        correctAnswers,
        timeLeft: totalTime >= 0 ? totalTime : 0
    };

    localStorage.setItem("latestResult", JSON.stringify(resultData));

    // Save history
    const history = JSON.parse(localStorage.getItem("quizHistory")) || [];
    history.push(resultData);
    localStorage.setItem("quizHistory", JSON.stringify(history));

    // Go to results page
    window.location.href = "result.html";
}

// ================= REVIEW MODE =================
function handleReviewMode() {
    if (localStorage.getItem("reviewMode") !== "true") return;

    const latestResult = JSON.parse(localStorage.getItem("latestResult"));
    if (!latestResult) return;

    const { userAnswers, correctAnswers } = latestResult;

    for (const q in correctAnswers) {
        const userValue = userAnswers[q];
        if (!userValue) continue;

        const inputElem = document.querySelector(`input[name="${q}"][value="${userValue}"]`);
        if (!inputElem) continue;

        const quizDiv = inputElem.closest(".quiz-question");
        inputElem.checked = true;
        inputElem.parentElement.classList.add("selected");
        inputElem.parentElement.style.border = userValue === correctAnswers[q] ? "2px solid blue" : "2px solid red";

        const showBtn = quizDiv.querySelector(".show-answer-btn");
        if (showBtn) showBtn.onclick = () => {
            const explanation = quizDiv.querySelector(".answer-explanation");
            explanation.style.display = explanation.style.display === 'block' ? 'none' : 'block';
        };
    }

    // Disable all inputs in review mode
    document.querySelectorAll('.option input[type="radio"]').forEach(input => input.disabled = true);

    // Optional back button
    const container = document.querySelector(".quiz-container");
    if (container) {
        const backBtn = document.createElement("button");
        backBtn.textContent = "Back to Result";
        backBtn.className = "btn btn-outline";
        backBtn.onclick = () => window.location.href = "result.html";
        container.prepend(backBtn);
    }

    localStorage.removeItem("reviewMode");
}