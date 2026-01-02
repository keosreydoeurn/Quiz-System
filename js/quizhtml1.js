// ================= QUIZ TIMER =================
let totalTime = 2 * 60; // 10 minutes
let timerInterval;

window.addEventListener("DOMContentLoaded", () => {
    startTimer();
    handleReviewMode();
    setupOptionSelection();
    setupShowAnswerButtons();
    document.getElementById("submitBtn")?.addEventListener("click", submitQuiz);
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
function setupOptionSelection() {
    const options = document.querySelectorAll(".option");
    options.forEach(option => {
        option.addEventListener("click", () => {
            if (localStorage.getItem("reviewMode") === "true") return;

            const allOptions = option.parentElement.querySelectorAll(".option");
            allOptions.forEach(opt => opt.classList.remove("selected"));

            option.classList.add("selected");
            const input = option.querySelector('input');
            if (input) input.checked = true;
        });
    });
}

// ================= SHOW ANSWER BUTTON =================
function setupShowAnswerButtons() {
    const showBtns = document.querySelectorAll(".show-answer-btn");
    showBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const explanation = btn.nextElementSibling;
            if (explanation) {
                explanation.style.display = explanation.style.display === "block" ? "none" : "block";
            }
        });
    });

    // Hide all explanations initially
    document.querySelectorAll(".answer-explanation").forEach(exp => exp.style.display = "none");
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
        const inputRadio = document.querySelector(`input[name="${q}"]:checked`);
        const answer = inputRadio ? inputRadio.value : "";
        if (!answer) continue;

        userAnswers[q] = answer;
        if (answer.toLowerCase() === correctAnswers[q].toLowerCase()) score++;
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
        quizPage: window.location.pathname.split("/").pop()
    };

    localStorage.setItem("latestResult", JSON.stringify(resultData));

    const history = JSON.parse(localStorage.getItem("quizHistory")) || [];
    history.push(resultData);
    localStorage.setItem("quizHistory", JSON.stringify(history));

    window.location.href = "result.html";
}

// ================= REVIEW MODE =================
function handleReviewMode() {
    if (localStorage.getItem("reviewMode") !== "true") return;

    const latestResult = JSON.parse(localStorage.getItem("latestResult"));
    if (!latestResult) return;

    const { userAnswers, correctAnswers } = latestResult;

    for (const q in correctAnswers) {
        const answer = userAnswers[q];
        if (!answer) continue;

        const inputRadio = document.querySelector(`input[name="${q}"][value="${answer}"]`);
        if (!inputRadio) continue;

        const quizDiv = inputRadio.closest(".quiz-question");
        inputRadio.checked = true;
        inputRadio.parentElement.classList.add("selected");

        // Border: blue=correct, red=wrong
        inputRadio.parentElement.style.border = answer.toLowerCase() === correctAnswers[q].toLowerCase() ? "2px solid blue" : "2px solid red";

        // Show explanation automatically
        const explanation = quizDiv.querySelector(".answer-explanation");
        if (explanation) explanation.style.display = "block";
    }

    // Disable all inputs
    document.querySelectorAll('input').forEach(input => input.disabled = true);

    // Add Back to Result button
    const container = document.querySelector(".quiz-container");
    if (container) {
        const backBtn = document.createElement("button");
        backBtn.textContent = "Back to Result";
        backBtn.className = "btn btn-outline";
        backBtn.addEventListener("click", () => window.location.href = "result.html");
        container.prepend(backBtn);
    }

    localStorage.removeItem("reviewMode");
}
