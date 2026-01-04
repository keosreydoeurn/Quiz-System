// ================= QUIZ TIMER =================
let totalTime = 3 * 60; // 3 minutes
let timerInterval;
let quizSubmitted = false; // Track if quiz has been submitted

window.addEventListener("DOMContentLoaded", () => {
    startTimer();
    handleReviewMode();
    attachOptionHandlers();
    attachShowAnswerHandlers();
    document.getElementById("submitQuizBtn")?.addEventListener("click", submitQuiz);
});

// ================= START TIMER =================
function startTimer() {
    const timeDisplay = document.getElementById("time");
    if (!timeDisplay) return;

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

// ================= OPTION SELECTION =================
function attachOptionHandlers() {
    const optionDivs = document.querySelectorAll(".option");
    optionDivs.forEach(option => {
        option.addEventListener("click", () => {
            if (quizSubmitted || localStorage.getItem("reviewMode") === "true") return;

            const siblings = option.parentElement.querySelectorAll(".option");
            siblings.forEach(sib => sib.classList.remove("selected"));

            option.classList.add("selected");

            const input = option.querySelector('input[type="radio"]');
            if (input) input.checked = true;
        });
    });
}

// ================= SHOW ANSWER BUTTONS =================
function attachShowAnswerHandlers() {
    const showButtons = document.querySelectorAll(".show-answer-btn");
    showButtons.forEach(btn => {
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
            const explanation = quizDiv.querySelector(".answer-explanation");
            if (explanation) {
                explanation.style.display = explanation.style.display === "block" ? "none" : "block";
            }

            highlightAnswers(quizDiv);
        });
    });
}

function enableShowAnswerButtons() {
    const showButtons = document.querySelectorAll(".show-answer-btn");
    showButtons.forEach(btn => {
        btn.disabled = false;
        btn.style.opacity = "1";
        btn.style.cursor = "pointer";
        btn.title = "Click to reveal the answer";
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
        div.style.border = "2px solid #ddd"; // reset
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

// ================= SUBMIT QUIZ =================
function submitQuiz() {
    if (quizSubmitted) return; // prevent multiple submissions

    clearInterval(timerInterval);
    quizSubmitted = true;
    enableShowAnswerButtons();

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
        const textInput = document.querySelector(`input[name="${q}"].text-answer`);

        if (selected) {
            userAnswers[q] = selected.value;
            if (selected.value.toLowerCase() === correctAnswers[q].toLowerCase()) score++;
        } else if (textInput) {
            userAnswers[q] = textInput.value.trim();
            if (userAnswers[q].toLowerCase() === correctAnswers[q].toLowerCase()) score++;
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

    // Disable all inputs after submit
    document.querySelectorAll('.option input[type="radio"], .text-answer').forEach(i => i.disabled = true);

    // Optionally redirect to result page
    // window.location.href = "result.html";
}

// ================= REVIEW MODE =================
function handleReviewMode() {
    if (localStorage.getItem("reviewMode") !== "true") return;

    const latestResult = JSON.parse(localStorage.getItem("latestResult"));
    if (!latestResult) return;

    quizSubmitted = true;
    enableShowAnswerButtons();

    const { userAnswers, correctAnswers } = latestResult;

    for (const q in correctAnswers) {
        const userValue = userAnswers[q];
        if (!userValue) continue;

        const inputElem = document.querySelector(`input[name="${q}"][value="${userValue}"]`);
        const textInput = document.querySelector(`input[name="${q}"].text-answer`);
        let quizDiv;

        if (inputElem) {
            inputElem.checked = true;
            inputElem.parentElement.classList.add("selected");
            inputElem.parentElement.style.border = userValue === correctAnswers[q] ? "2px solid green" : "2px solid red";

            quizDiv = inputElem.closest(".quiz-question");

            const correctInput = document.querySelector(`input[name="${q}"][value="${correctAnswers[q]}"]`);
            if (correctInput) correctInput.parentElement.style.border = "2px solid green";
        } else if (textInput) {
            textInput.value = userValue;
            textInput.style.border = userValue.toLowerCase() === correctAnswers[q].toLowerCase() ? "2px solid green" : "2px solid red";
            quizDiv = textInput.closest(".quiz-question");
        }

        if (quizDiv) {
            const explanation = quizDiv.querySelector(".answer-explanation");
            if (explanation) explanation.style.display = "block";
        }
    }

    // Disable all inputs in review mode
    document.querySelectorAll('.option input[type="radio"], .text-answer').forEach(i => i.disabled = true);

    localStorage.removeItem("reviewMode");
}
