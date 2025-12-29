// correct answers
const answers = {
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

// option click (radio UI)
function selectOption(option) {
    const options = option.parentElement.querySelectorAll(".option");
    options.forEach(opt => opt.classList.remove("selected"));
    option.classList.add("selected");
    option.querySelector("input").checked = true;
}

// submit quiz
function submitQuiz() {
    let score = 0;
    let total = Object.keys(answers).length;

    document.querySelectorAll(".quiz-question").forEach((question, index) => {
        const qNum = "q" + (index + 1);
        const correct = answers[qNum];
        let userAnswer = "";

        // radio
        const checked = question.querySelector("input[type='radio']:checked");
        if (checked) {
            userAnswer = checked.value;
        }

        // text input
        const textInput = question.querySelector(".text-answer");
        if (textInput) {
            userAnswer = textInput.value.trim().toLowerCase();
        }

        // compare
        if (userAnswer === correct.toLowerCase()) {
            question.style.border = "2px solid green";
            score++;
        } else {
            question.style.border = "2px solid red";
        }
    });

    // enable view result
    const viewResultBtn = document.querySelector(".quiz-navigation a:last-child");
    viewResultBtn.href = "#";
    viewResultBtn.onclick = () => {
        alert(`Your Score: ${score} / ${total}`);
    };
}

// show answer buttons
document.querySelectorAll(".show-answer-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const answerBox = btn.nextElementSibling;
        answerBox.style.display =
            answerBox.style.display === "block" ? "none" : "block";
    });
});
