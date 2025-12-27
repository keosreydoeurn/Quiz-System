// ================= RESULT.JS =================
window.addEventListener('DOMContentLoaded', () => {
    const latestResult = JSON.parse(localStorage.getItem('latestResult'));
    if (!latestResult) return console.warn('No quiz results found.');

    const { score, total, percentage, date, userAnswers, correctAnswers, timeSpent } = latestResult;

    // --- Update Score Metrics ---
    const percentageElem = document.getElementById('percentage');
    const correctElem = document.getElementById('correctAnswers');
    const completionElem = document.querySelector('.text-muted');
    const timeElem = document.getElementById('timeSpent');

    percentageElem.textContent = `${percentage}%`;
    correctElem.textContent = `${score}/${total}`;
    if (date) completionElem.textContent = `Completed on ${date}`;
    if (timeSpent) timeElem.textContent = timeSpent;

    // --- Score Message ---
    const scoreText = document.getElementById('scoreText');
    scoreText.textContent =
        percentage >= 90 ? 'Excellent!' :
        percentage >= 75 ? 'Great Job!' :
        percentage >= 50 ? 'Good Try!' :
        'Keep Practicing!';

    // --- Update Circle Color ---
    const scoreCircle = document.querySelector('.score-circle');
    scoreCircle.classList.remove('high-score', 'medium-score', 'low-score');
    scoreCircle.classList.add(
        percentage >= 75 ? 'high-score' :
        percentage >= 50 ? 'medium-score' :
        'low-score'
    );

    // --- Review Mode ---
    if (localStorage.getItem('reviewMode') === 'true' && userAnswers && correctAnswers) {
        Object.entries(userAnswers).forEach(([q, userValue]) => {
            const inputElem = document.querySelector(`input[name="${q}"][value="${userValue}"]`);
            if (!inputElem) return;

            const quizDiv = inputElem.closest('.quiz-question');

            // Mark selection
            inputElem.checked = true;
            inputElem.parentElement.classList.add('selected');

            // Border color for correct/incorrect
            inputElem.parentElement.style.border = userValue === correctAnswers[q]
                ? '2px solid blue'
                : '2px solid red';

            // Show/Hide explanation toggle
            const showBtn = quizDiv.querySelector('.show-answer-btn');
            if (showBtn) {
                showBtn.disabled = false;
                showBtn.onclick = () => {
                    const explanation = quizDiv.querySelector('.answer-explanation');
                    explanation.style.display = explanation.style.display === 'block' ? 'none' : 'block';
                };
            }
        });

        // Disable all radio inputs in review mode
        document.querySelectorAll('.option input[type="radio"]').forEach(input => input.disabled = true);
    }
});
