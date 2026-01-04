// ================= QUIZ TIMER =================
let totalTime = 5 * 60; // 5 minutes
let timerInterval;
let quizSubmitted = false;

// ---------------- ON PAGE LOAD ----------------
window.addEventListener("DOMContentLoaded", () => {
    startTimer();
    setupOptionSelection();
    setupShowAnswerButtons();
    setupSubmitButton();
    handleReviewMode();
});

// ================= START TIMER =================
function startTimer() {
    const timeDisplay = document.getElementById("time");
    if (!timeDisplay) return;

    timeDisplay.style.position = "sticky";
    timeDisplay.style.top = "10px";
    timeDisplay.style.zIndex = "1000";
    timeDisplay.style.fontWeight = "700";

    timerInterval = setInterval(() => {
        if (quizSubmitted) return;

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

// ================= OPTION SELECTION =================
function setupOptionSelection() {
    document.querySelectorAll(".option").forEach(optionDiv => {
        optionDiv.addEventListener("click", () => {
            if (quizSubmitted || localStorage.getItem("reviewMode") === "true") return;

            const siblings = optionDiv.parentElement.querySelectorAll(".option");
            siblings.forEach(sib => sib.classList.remove("selected"));

            optionDiv.classList.add("selected");

            const input = optionDiv.querySelector('input[type="radio"]');
            if (input) input.checked = true;
        });
    });
}

// ================= SHOW ANSWER BUTTONS =================
function setupShowAnswerButtons() {
    document.querySelectorAll(".show-answer-btn").forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = "0.5";
        btn.style.cursor = "not-allowed";
        btn.title = "Submit the quiz to reveal answers";

        btn.addEventListener("click", () => {
            if (!quizSubmitted) {
                alert("Please submit the quiz first to see answers.");
                return;
            }

            const quizDiv = btn.closest(".quiz-question");
            const answerDiv = quizDiv.querySelector(".answer-explanation");
            if (answerDiv) answerDiv.style.display = answerDiv.style.display === "block" ? "none" : "block";

            highlightAnswers(quizDiv);
        });
    });

    document.querySelectorAll(".answer-explanation").forEach(exp => exp.style.display = "none");
}

// Enable show-answer buttons
function enableShowAnswerButtons() {
    document.querySelectorAll(".show-answer-btn").forEach(btn => {
        btn.disabled = false;
        btn.style.opacity = "1";
        btn.style.cursor = "pointer";
        btn.title = "Click to reveal answers";
    });
}

// ================= HIGHLIGHT ANSWERS =================
function highlightAnswers(quizDiv) {
    const result = JSON.parse(localStorage.getItem("latestResult"));
    if (!result) return;

    const qName = quizDiv.querySelector("input")?.name;
    if (!qName) return;

    const correct = result.correctAnswers[qName];

    quizDiv.querySelectorAll('input[type="radio"]').forEach(input => {
        const div = input.parentElement;
        div.style.border = "2px solid #ddd";
        if (input.value === correct) div.style.border = "2px solid green";
        if (input.checked && input.value !== correct) div.style.border = "2px solid red";
    });

    const textInput = quizDiv.querySelector('input[type="text"]');
    if (textInput) {
        textInput.style.border =
            textInput.value.trim().toLowerCase() === correct.toLowerCase()
                ? "2px solid green"
                : "2px solid red";
    }
}

// ================= SUBMIT BUTTON =================
function setupSubmitButton() {
    const submitBtn = document.getElementById("submitQuizBtn");
    if (submitBtn) submitBtn.addEventListener("click", submitQuiz);
}

// ================= SUBMIT QUIZ =================
function submitQuiz() {
    if (quizSubmitted) return;

    clearInterval(timerInterval);
    quizSubmitted = true;

    enableShowAnswerButtons();

    const correctAnswers = {
        q1: "a", q2: "a", q3: "b", q4: "a", q5: "b",
        q6: "a", q7: "a", q8: "a", q9: "a", q10: "a",
        q11: "b", q12: "b", q13: "a", q14: "a", q15: "a"
    };

    let score = 0;
    const userAnswers = {};

    Object.keys(correctAnswers).forEach(q => {
        const options = document.querySelectorAll(`input[name="${q}"]`);
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

    // Save results
    const history = JSON.parse(localStorage.getItem("quizHistory")) || [];
    history.push(resultData);
    localStorage.setItem("quizHistory", JSON.stringify(history));
    localStorage.setItem("latestResult", JSON.stringify(resultData));

}

// ================= REVIEW MODE =================
function handleReviewMode() {
    if (localStorage.getItem("reviewMode") !== "true") return;

    const latestResult = JSON.parse(localStorage.getItem("latestResult"));
    if (!latestResult) return;

    const { userAnswers, correctAnswers } = latestResult;

    quizSubmitted = true;
    enableShowAnswerButtons();

    Object.keys(correctAnswers).forEach(q => {
        const userValue = userAnswers[q];
        if (!userValue) return;

        const inputElem = document.querySelector(`input[name="${q}"][value="${userValue}"]`);
        if (!inputElem) return;

        const quizDiv = inputElem.closest(".quiz-question");
        inputElem.checked = true;
        inputElem.parentElement.classList.add("selected");
        inputElem.parentElement.style.border = userValue === correctAnswers[q] ? "2px solid green" : "2px solid red";

        // Highlight correct answer
        const correctInput = document.querySelector(`input[name="${q}"][value="${correctAnswers[q]}"]`);
        if (correctInput) correctInput.parentElement.style.border = "2px solid green";

        const answerDiv = quizDiv.querySelector(".answer-explanation");
        if (answerDiv) answerDiv.style.display = "block";

        inputElem.disabled = true;
    });

    // Disable all options in review mode
    document.querySelectorAll(".option input[type='radio']").forEach(input => input.disabled = true);

    localStorage.removeItem("reviewMode");
}
