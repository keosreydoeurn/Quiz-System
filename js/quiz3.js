function submitQuiz() {
    const correctAnswers = {
        q1: "a",
        q2: "a",
        q3: "b",
        q4: "a",
        q5: "b",
        q6: "a",
        q7: "a",
        q8: "a",
        q9: "a",
        q10: "a",
        q11: "b",
        q12: "b",
        q13: "a",
        q14: "a",
        q15: "a"
    };

    Object.keys(correctAnswers).forEach(question => {
        const options = document.querySelectorAll(`input[name="${question}"]`);

        options.forEach(option => {
            const optionDiv = option.parentElement;
            // Reset borders first
            optionDiv.style.border = "2px solid #ddd";

            if (option.checked) {
                if (option.value === correctAnswers[question]) {
                    optionDiv.style.border = "2px solid green";   // ✅ correct
                } else {
                    optionDiv.style.border = "2px solid red";     // ❌ wrong
                }
            }
        });

        // Enable show answer button
        const quizDiv = options[0].closest(".quiz-question");
        const showBtn = quizDiv.querySelector(".show-answer-btn");
        showBtn.disabled = false;
        showBtn.onclick = () => {
            quizDiv.querySelector(".answer-explanation").style.display = "block";
        };
    });
}


