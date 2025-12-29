function submitQuiz() {
  const correctAnswers = {
    q1: "a", q2: "a", q3: "b", q4: "a", q5: "b",
    q6: "a", q7: "a", q8: "a", q9: "a", q10: "a",
    q11: "b", q12: "b", q13: "a", q14: "a", q15: "a"
  };

  let score = 0;
  const total = Object.keys(correctAnswers).length;

  Object.keys(correctAnswers).forEach(question => {
    const options = document.querySelectorAll(`input[name="${question}"]`);
    let selected = null;

    options.forEach(option => {
      const optionDiv = option.parentElement;

      // Reset border
      optionDiv.style.border = "2px solid #ddd";

      if (option.checked) {
        selected = option;

        if (option.value === correctAnswers[question]) {
          optionDiv.style.border = "2px solid green"; // ✅ correct
          score++;
        } else {
          optionDiv.style.border = "2px solid red";   // ❌ wrong
        }
      }
    });

    // Enable Show Answer button
    if (options.length > 0) {
      const quizDiv = options[0].closest(".quiz-question");
      const showBtn = quizDiv.querySelector(".show-answer-btn");
      const answerDiv = quizDiv.querySelector(".answer-explanation");

      showBtn.disabled = false;
      showBtn.onclick = () => {
        answerDiv.style.display = "block";
      };
    }
  });

  /* ===========================
     ✅ SAVE RESULT (HISTORY)
  ============================ */
  const percentage = Math.round((score / total) * 100);

  const resultData = {
    score: score,
    total: total,
    percentage: percentage,
    date: new Date().toLocaleString()
  };

  // Get old history or empty array
  let history = JSON.parse(localStorage.getItem("quizHistory")) || [];

  // Add new result
  history.push(resultData);

  // Save to localStorage
  localStorage.setItem("quizHistory", JSON.stringify(history));
  localStorage.setItem("latestResult", JSON.stringify(resultData));
}

function goToResult() {
  window.location.href = "result.html";
}
