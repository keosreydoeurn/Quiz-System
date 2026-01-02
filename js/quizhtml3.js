// ================= QUIZ TIMER =================
let totalTime = 5 * 60; // 15 minutes
let timerInterval;

window.addEventListener("DOMContentLoaded", () => {
    startTimer();
    setupOptions();
    setupShowAnswerButtons();
    setupSubmitButton();
    handleReviewMode();
});

// ---------------- TIMER ----------------
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

// ---------------- OPTION SELECTION ----------------
function setupOptions() {
    document.querySelectorAll(".option").forEach(optionDiv => {
        optionDiv.addEventListener("click", () => {
            if (localStorage.getItem("reviewMode") === "true") return;

            const allOptions = optionDiv.parentElement.querySelectorAll(".option");
            allOptions.forEach(opt => opt.classList.remove("selected"));

            optionDiv.classList.add("selected");
            const input = optionDiv.querySelector('input[type="radio"]');
            if (input) input.checked = true;
        });
    });
}

// ---------------- SHOW ANSWER BUTTONS ----------------
function setupShowAnswerButtons() {
    document.querySelectorAll(".show-answer-btn").forEach(btn => {
        const quizDiv = btn.closest(".quiz-question");
        const answerDiv = quizDiv.querySelector(".answer-explanation");
        btn.addEventListener("click", () => {
            if (answerDiv) {
                answerDiv.style.display = answerDiv.style.display === "block" ? "none" : "block";
            }
        });
    });
}

// ---------------- SUBMIT BUTTON ----------------
function setupSubmitButton() {
    const submitBtn = document.getElementById("submitQuizBtn");
    if (submitBtn) {
        submitBtn.addEventListener("click", submitQuiz);
    }
}

// ---------------- SUBMIT QUIZ ----------------
function submitQuiz() {
    clearInterval(timerInterval);

    const correctAnswers = {
        q1: "a", q2: "a", q3: "b", q4: "a", q5: "b",
        q6: "a", q7: "a", q8: "a", q9: "a", q10: "a",
        q11: "b", q12: "b", q13: "a", q14: "a", q15: "a"
    };

    let score = 0;
    const total = Object.keys(correctAnswers).length;
    const userAnswers = {};

    Object.keys(correctAnswers).forEach(q => {
        const options = document.querySelectorAll(`input[name="${q}"]`);
        if (!options.length) return;

        options.forEach(option => {
            const optionDiv = option.parentElement;
            optionDiv.style.border = "2px solid #ddd";
            option.disabled = true;

            if (option.checked) {
                userAnswers[q] = option.value;
                optionDiv.style.border = option.value === correctAnswers[q] ? "2px solid green" : "2px solid red";
                if (option.value === correctAnswers[q]) score++;
            }
        });
    });

    // Disable show-answer buttons
    document.querySelectorAll(".show-answer-btn").forEach(btn => btn.disabled = true);

    const percentage = Math.round((score / total) * 100);
    const resultData = {
        score,
        total,
        percentage,
        date: new Date().toLocaleString(),
        userAnswers,
        correctAnswers,
        quizPage: window.location.pathname.split("/").pop()
    };

    // Save to localStorage
    const history = JSON.parse(localStorage.getItem("quizHistory")) || [];
    history.push(resultData);
    localStorage.setItem("quizHistory", JSON.stringify(history));
    localStorage.setItem("latestResult", JSON.stringify(resultData));

    // Redirect to result page
    window.location.href = "result.html";
}

// ---------------- REVIEW MODE ----------------
function handleReviewMode() {
    if (localStorage.getItem("reviewMode") !== "true") return;
    const latestResult = JSON.parse(localStorage.getItem("latestResult"));
    if (!latestResult) return;

    const { userAnswers, correctAnswers } = latestResult;

    Object.keys(correctAnswers).forEach(q => {
        const userValue = userAnswers[q];
        if (!userValue) return;

        const inputElem = document.querySelector(`input[name="${q}"][value="${userValue}"]`);
        if (!inputElem) return;

        const quizDiv = inputElem.closest(".quiz-question");
        inputElem.checked = true;
        inputElem.parentElement.classList.add("selected");
        inputElem.parentElement.style.border = userValue === correctAnswers[q] ? "2px solid green" : "2px solid red";

        // Show correct answer for all
        const correctInput = document.querySelector(`input[name="${q}"][value="${correctAnswers[q]}"]`);
        if (correctInput) correctInput.parentElement.style.border = "2px solid green";

        const answerDiv = quizDiv.querySelector(".answer-explanation");
        if (answerDiv) answerDiv.style.display = "block";

        inputElem.disabled = true;
    });

    document.querySelectorAll(".option input[type='radio']").forEach(input => input.disabled = true);
    document.querySelectorAll(".show-answer-btn").forEach(btn => btn.disabled = true);

    localStorage.removeItem("reviewMode");
}
