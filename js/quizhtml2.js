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
        q1: "b",
        q2: "b",
        q3: "alt",
        q4: "b",
        q5: "a",
        q6: "padding",
        q7: "b",
        q8: "a",
        q9: "nav",
        q10: "b"
    };

    let score = 0;
    const userAnswers = {};

    for (const q in correctAnswers) {
        const selected = document.querySelector(`input[name="${q}"]:checked`);
        if (!selected) continue;

        userAnswers[q] = selected.value;
        if (selected.value === correctAnswers[q]) score++;
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
        timeLeft: totalTime >= 0 ? totalTime : 0,
        quizPage: window.location.pathname.split("/").pop() // Save the current quiz page
    };

    localStorage.setItem("latestResult", JSON.stringify(resultData));

    // Save quiz history
    const history = JSON.parse(localStorage.getItem("quizHistory")) || [];
    history.push(resultData);
    localStorage.setItem("quizHistory", JSON.stringify(history));

    // Redirect to results page
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

        // Color borders: blue = correct, red = wrong
        inputElem.parentElement.style.border = userValue === correctAnswers[q] ? "2px solid blue" : "2px solid red";

        const showBtn = quizDiv.querySelector(".show-answer-btn");
        if (showBtn) showBtn.onclick = () => {
            const explanation = quizDiv.querySelector(".answer-explanation");
            explanation.style.display = explanation.style.display === 'block' ? 'none' : 'block';
        };

        // Automatically show explanation
        const explanation = quizDiv.querySelector(".answer-explanation");
        if (explanation) explanation.style.display = "block";
    }

    // Disable all inputs
    document.querySelectorAll('.option input[type="radio"]').forEach(input => input.disabled = true);

    // Remove reviewMode flag so it's only used once
    localStorage.removeItem("reviewMode");
}
