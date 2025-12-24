function selectOption(option) {
    // Highlight selected option
    const allOptions = option.parentElement.querySelectorAll('.option');
    allOptions.forEach(opt => opt.classList.remove('selected'));
    option.classList.add('selected');

    // Check the radio button
    const radio = option.querySelector('input[type="radio"]');
    radio.checked = true;
}

function submitQuiz() {
    // Define correct answers
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

    // Loop through each question
    for (let q in correctAnswers) {
        const selected = document.querySelector(`input[name="${q}"]:checked`);
        const options = document.querySelectorAll(`input[name="${q}"]`);

        // Reset borders first
        options.forEach(opt => opt.parentElement.style.border = "none");

        if (!selected) continue; // skip if no selection

        if (selected.value === correctAnswers[q]) {
            selected.parentElement.style.border = "2px solid green"; // correct
        } else {
            selected.parentElement.style.border = "2px solid red";   // wrong
        }

        // Enable Show Answer button
        const quizDiv = selected.closest(".quiz-question");
        const showBtn = quizDiv.querySelector(".show-answer-btn");
        showBtn.disabled = false;

        // Show answer on button click
        showBtn.addEventListener("click", function() {
            const answerDiv = quizDiv.querySelector(".answer-explanation");
            answerDiv.style.display = "block";
        });
    }
}



