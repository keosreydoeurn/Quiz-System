// ================= QUIZ TIMER =================
let totalTime = 15 * 60; // 15 minutes
let timerInterval;

window.addEventListener("DOMContentLoaded", () => {
    startTimer();
    handleReviewMode();
});

// Timer
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
        q1: "a", q2: "a", q3: "b", q4: "a", q5: "b",
        q6: "a", q7: "a", q8: "a", q9: "a", q10: "a",
        q11: "b", q12: "b", q13: "a", q14: "a", q15: "a"
    };

    let score = 0;
    const total = Object.keys(correctAnswers).length;
    const userAnswers = {};

    Object.keys(correctAnswers).forEach(question => {
        const options = document.querySelectorAll(`input[name="${question}"]`);
        if (!options.length) return;

        const quizDiv = options[0].closest(".quiz-question");
        const showBtn = quizDiv.querySelector(".show-answer-btn");
        const answerDiv = quizDiv.querySelector(".answer-explanation");

        options.forEach(option => {
            const optionDiv = option.parentElement;
            optionDiv.style.border = "2px solid #ddd";

            if (option.checked) {
                userAnswers[question] = option.value;

                if (option.value === correctAnswers[question]) {
                    optionDiv.style.border = "2px solid green";
                    score++;
                } else {
                    optionDiv.style.border = "2px solid red";
                }
            }

            // Disable after submission
            option.disabled = true;
        });

        // Enable Show Answer button
        if (showBtn && answerDiv) {
            showBtn.disabled = false;
            showBtn.onclick = () => answerDiv.style.display = "block";
        }
    });

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

    // Save history
    const history = JSON.parse(localStorage.getItem("quizHistory")) || [];
    history.push(resultData);
    localStorage.setItem("quizHistory", JSON.stringify(history));
    localStorage.setItem("latestResult", JSON.stringify(resultData));

    // Redirect to result page
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

        const explanation = quizDiv.querySelector(".answer-explanation");
        if (explanation) explanation.style.display = "block";
    }

    document.querySelectorAll('.option input[type="radio"]').forEach(input => input.disabled = true);
    localStorage.removeItem("reviewMode");
}
