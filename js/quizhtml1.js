let totalTime = 2 * 60; // 2 minutes
let timerInterval;
let quizSubmitted = false;

// ON LOAD
window.addEventListener("DOMContentLoaded", () => {
    startTimer();
    handleReviewMode();
    setupOptionSelection();
    setupShowAnswerButtons();
    document.getElementById("submitBtn")?.addEventListener("click", submitQuiz);
});

// TIMER
function startTimer() {
    const timeDisplay = document.getElementById("time");
    if (!timeDisplay) return;

    timeDisplay.style.position = "sticky";
    timeDisplay.style.top = "10px";
    timeDisplay.style.zIndex = "1000";
    timeDisplay.style.fontWeight = "700";

    timerInterval = setInterval(() => {
        if (quizSubmitted) return; // freeze timer after submit

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

// OPTION SELECTION
function setupOptionSelection() {
    document.querySelectorAll(".option").forEach(option => {
        option.addEventListener("click", () => {
            if (quizSubmitted || localStorage.getItem("reviewMode") === "true") return;

            option.parentElement
                .querySelectorAll(".option")
                .forEach(opt => opt.classList.remove("selected"));

            option.classList.add("selected");
            const input = option.querySelector("input");
            if (input) input.checked = true;
        });
    });
}

// SHOW ANSWER BUTTONS
function setupShowAnswerButtons() {
    document.querySelectorAll(".show-answer-btn").forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = "0.5";
        btn.style.cursor = "not-allowed";
        btn.title = "Submit quiz to view answers";

        btn.addEventListener("click", () => {
            if (!quizSubmitted) {
                alert("Please submit the quiz first.");
                return;
            }

            const quizDiv = btn.closest(".quiz-question");
            const inputs = quizDiv.querySelectorAll("input[type=radio]");
            const questionName = inputs[0].name;

            const result = JSON.parse(localStorage.getItem("latestResult"));
            const correctAnswer = result.correctAnswers[questionName];

            // Highlight options
            inputs.forEach(input => {
                const div = input.parentElement;
                div.style.border = "2px solid #ddd"; // reset
                if (input.value === correctAnswer) div.style.border = "2px solid green";
                if (input.checked && input.value !== correctAnswer) div.style.border = "2px solid red";
            });

            // Toggle explanation
            const explanation = quizDiv.querySelector(".answer-explanation");
            if (explanation)
                explanation.style.display = explanation.style.display === "block" ? "none" : "block";
        });
    });

    // Hide all explanations initially
    document.querySelectorAll(".answer-explanation").forEach(exp => exp.style.display = "none");
}

function enableShowAnswerButtons() {
    document.querySelectorAll(".show-answer-btn").forEach(btn => {
        btn.disabled = false;
        btn.style.opacity = "1";
        btn.style.cursor = "pointer";
        btn.title = "Click to reveal answer";
    });
}

// SUBMIT QUIZ
function submitQuiz() {
    if (quizSubmitted) return;
    quizSubmitted = true;

    clearInterval(timerInterval);

    const timeDisplay = document.getElementById("time");
    if (timeDisplay) {
        const minutes = String(Math.floor(totalTime / 60)).padStart(2, "0");
        const seconds = String(Math.max(totalTime, 0) % 60).padStart(2, "0");
        timeDisplay.textContent = `${minutes}:${seconds}`;
    }

    enableShowAnswerButtons();

    const correctAnswers = {
        q1: "a", q2: "c", q3: "b", q4: "b", q5: "b",
        q6: "b", q7: "c", q8: "a", q9: "b", q10: "b"
    };

    const userAnswers = {};
    let score = 0;

    for (const q in correctAnswers) {
        const selected = document.querySelector(`input[name="${q}"]:checked`);
        if (!selected) continue;
        userAnswers[q] = selected.value;
        if (selected.value.toLowerCase() === correctAnswers[q]) score++;
    }

    const total = Object.keys(correctAnswers).length;
    const percentage = Math.round((score / total) * 100);

    const resultData = {
        score,
        total,
        percentage,
        userAnswers,
        correctAnswers,
        timeLeft: Math.max(totalTime, 0),
        date: new Date().toLocaleString(),
        quizPage: location.pathname.split("/").pop()
    };

    localStorage.setItem("latestResult", JSON.stringify(resultData));

    const history = JSON.parse(localStorage.getItem("quizHistory")) || [];
    history.push(resultData);
    localStorage.setItem("quizHistory", JSON.stringify(history));

    // Disable input changes after submit
    document.querySelectorAll("input").forEach(i => i.disabled = true);
}

// REVIEW MODE
function handleReviewMode() {
    if (localStorage.getItem("reviewMode") !== "true") return;

    const result = JSON.parse(localStorage.getItem("latestResult"));
    if (!result) return;

    const { userAnswers, correctAnswers } = result;

    for (const q in correctAnswers) {
        const answer = userAnswers[q];
        if (!answer) continue;

        const input = document.querySelector(`input[name="${q}"][value="${answer}"]`);
        if (!input) continue;

        input.checked = true;
        input.parentElement.classList.add("selected");
        input.parentElement.style.border =
            answer === correctAnswers[q] ? "2px solid green" : "2px solid red";

        const explanation = input.closest(".quiz-question")?.querySelector(".answer-explanation");
        if (explanation) explanation.style.display = "block";
    }

    document.querySelectorAll("input").forEach(i => i.disabled = true);

    const container = document.querySelector(".quiz-container");
    if (container) {
        const btn = document.createElement("button");
        btn.textContent = "Back to Result";
        btn.className = "btn btn-outline";
        btn.onclick = () => (window.location.href = "result.html");
        container.prepend(btn);
    }

    // Disable show-answer buttons
    document.querySelectorAll(".show-answer-btn").forEach(btn => btn.disabled = true);
    localStorage.removeItem("reviewMode");
}
