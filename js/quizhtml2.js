
// ================= QUIZ TIMER =================
let totalTime = 10 * 60; // 10 minutes
let timerInterval;
let quizSubmitted = false; // Track if quiz has been submitted

window.addEventListener("DOMContentLoaded", () => {
    startTimer();
    handleReviewMode();
    attachOptionHandlers();
    attachShowAnswerHandlers();
    document.getElementById("submitQuizBtn")?.addEventListener("click", submitQuiz);
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

// ================= SELECT OPTION HANDLERS =================
function attachOptionHandlers() {
    const optionDivs = document.querySelectorAll(".option");
    optionDivs.forEach(option => {
        option.addEventListener("click", () => {
            if (localStorage.getItem("reviewMode") === "true") return;

            const siblings = option.parentElement.querySelectorAll(".option");
            siblings.forEach(sib => sib.classList.remove("selected"));

            option.classList.add("selected");

            const input = option.querySelector('input[type="radio"]');
            if (input) input.checked = true;
        });
    });
}

// ================= SHOW ANSWER HANDLERS =================
function attachShowAnswerHandlers() {
    const showButtons = document.querySelectorAll(".show-answer-btn");
    showButtons.forEach(btn => {
        // Initially disable the button
        btn.disabled = true;
        btn.style.opacity = "0.5";
        btn.style.cursor = "not-allowed";
        btn.title = "Submit the quiz to reveal answers";

        btn.addEventListener("click", () => {
            // Only allow if quiz is submitted
            if (!quizSubmitted) {
                alert("Please submit the quiz first to see answers.");
                return;
            }

            const explanation = btn.nextElementSibling;
            if (explanation) {
                explanation.style.display = explanation.style.display === "block" ? "none" : "block";
            }
        });
    });
}

// Function to enable show-answer buttons after submission
function enableShowAnswerButtons() {
    const showButtons = document.querySelectorAll(".show-answer-btn");
    showButtons.forEach(btn => {
        btn.disabled = false;
        btn.style.opacity = "1";
        btn.style.cursor = "pointer";
        btn.title = "Click to reveal the answer";
    });
}

// ================= SUBMIT QUIZ =================
function submitQuiz() {
    clearInterval(timerInterval);
    quizSubmitted = true; // Mark quiz as submitted
    enableShowAnswerButtons(); // Enable show-answer buttons

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
        const inputElem = document.querySelector(`input[name="${q}"]`);
        if (inputElem && inputElem.type === "text") {
            userAnswers[q] = inputElem.value.trim();
            if (userAnswers[q].toLowerCase() === correctAnswers[q].toLowerCase()) score++;
        } else {
            const selected = document.querySelector(`input[name="${q}"]:checked`);
            if (!selected) continue;
            userAnswers[q] = selected.value;
            if (selected.value === correctAnswers[q]) score++;
        }
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
        const userValue = userAnswers[q];
        if (!userValue) continue;

        const inputElem = document.querySelector(`input[name="${q}"][value="${userValue}"]`);
        const textInput = document.querySelector(`input[name="${q}"]`);
        let quizDiv;

        if (inputElem) {
            inputElem.checked = true;
            inputElem.parentElement.classList.add("selected");
            quizDiv = inputElem.closest(".quiz-question");
            // Border color for correct/wrong
            inputElem.parentElement.style.border = userValue === correctAnswers[q] ? "2px solid blue" : "2px solid red";
        } else if (textInput) {
            textInput.value = userValue;
            quizDiv = textInput.closest(".quiz-question");
            textInput.style.border = userValue.toLowerCase() === correctAnswers[q].toLowerCase() ? "2px solid blue" : "2px solid red";
        }

        // Show explanation
        if (quizDiv) {
            const explanation = quizDiv.querySelector(".answer-explanation");
            if (explanation) explanation.style.display = "block";
        }
    }

    // Disable all inputs
    document.querySelectorAll('.option input[type="radio"], .text-answer').forEach(input => input.disabled = true);

    localStorage.removeItem("reviewMode");
}
