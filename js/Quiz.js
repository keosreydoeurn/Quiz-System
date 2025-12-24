function submitQuiz() {
    const correctAnswers = {
        q1: "a",
        q2: "c",
        q3: "b",
        q4: "b",
        q5: "b",
        q6: "b",
        q7: "c",
        q8: "a",
        q9: "b",
        q10: "b"
    };

    let score = 0;
    let total = Object.keys(correctAnswers).length;

    for (let q in correctAnswers) {
        const selected = document.querySelector(`input[name="${q}"]:checked`);
        const options = document.querySelectorAll(`input[name="${q}"]`);

        options.forEach(opt => opt.parentElement.style.border = "none");

        if (!selected) continue;

        if (selected.value === correctAnswers[q]) {
            selected.parentElement.style.border = "2px solid green";
            score++; // count correct
        } else {
            selected.parentElement.style.border = "2px solid red";
        }

        const quizDiv = selected.closest(".quiz-question");
        const showBtn = quizDiv.querySelector(".show-answer-btn");
        showBtn.disabled = false;

        showBtn.onclick = function () {
            quizDiv.querySelector(".answer-explanation").style.display = "block";
        };
    }

    // Save result
    const percentage = Math.round((score / total) * 100);
    localStorage.setItem("score", score);
    localStorage.setItem("total", total);
    localStorage.setItem("percentage", percentage);

    // Go to result page
    window.location.href = "result.html";
}
