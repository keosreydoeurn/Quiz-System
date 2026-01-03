import { app, auth } from "./firebase.js";
import { getDatabase, ref, update, push } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", () => {
    const latestResult = JSON.parse(localStorage.getItem("latestResult"));

    const percentageElem = document.getElementById("percentage");
    const correctAnswersElem = document.getElementById("correctAnswers");
    const scoreTextElem = document.getElementById("scoreText");
    const attemptDateElem = document.getElementById("attemptDate");
    const timeSpentElem = document.getElementById("timeSpent");
    const averageScoreElem = document.getElementById("averageScore");
    const rankPercentElem = document.getElementById("rankPercent");
    const reviewBtn = document.getElementById("reviewBtn");

    if (!latestResult) {
        if (percentageElem) percentageElem.textContent = "0%";
        if (correctAnswersElem) correctAnswersElem.textContent = "0/0";
        if (scoreTextElem) scoreTextElem.textContent = "No Quiz Taken Yet";
        if (attemptDateElem) attemptDateElem.textContent = "-";
        return;
    }

    const { score, total, percentage, date, quizPage } = latestResult;

    // Update UI
    if (percentageElem) percentageElem.textContent = `${percentage}%`;
    if (correctAnswersElem) correctAnswersElem.textContent = `${score}/${total}`;
    if (attemptDateElem) attemptDateElem.textContent = date || "-";

    if (scoreTextElem) {
        if (percentage >= 80) scoreTextElem.textContent = "Excellent Work! 🎉";
        else if (percentage >= 60) scoreTextElem.textContent = "Good Job! 👍";
        else if (percentage >= 40) scoreTextElem.textContent = "Not Bad 🙂";
        else scoreTextElem.textContent = "Keep Practicing 💪";
    }

    // Populate additional metrics (time spent, average score, rank)
    const formatTime = (secs) => {
        const s = parseInt(secs, 10) || 0;
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${String(sec).padStart(2, '0')} min`;
    };

    if (timeSpentElem) {
        const timeLeft = latestResult.timeLeft ?? latestResult.timeSpent ?? 0;
        timeSpentElem.textContent = formatTime(timeLeft);
    }

    if (averageScoreElem) {
        const history = JSON.parse(localStorage.getItem('quizHistory')) || [];
        if (history.length === 0 && typeof percentage === 'number') {
            averageScoreElem.textContent = `${percentage}%`;
        } else if (history.length > 0) {
            const avg = Math.round(history.reduce((s, r) => s + (r.percentage || 0), 0) / history.length);
            averageScoreElem.textContent = `${avg}%`;
        }
    }

    if (rankPercentElem) {
        rankPercentElem.textContent = "N/A";
    }

    // ✅ Wait for Firebase Auth to load user
    auth.onAuthStateChanged((user) => {
        if (user) {
            const db = getDatabase(app);
            const userRef = ref(db, `users/${user.uid}/results`);
            update(userRef, {
                lastScore: score,
                totalQuestions: total,
                percentage: percentage,
                date: date
            })
                .then(() => console.log("Quiz result saved to Firebase"))
                .catch((err) => console.error("Error saving result:", err));
            // Also push full result into user's Firebase history list
            try {
                const historyRef = ref(db, `users/${user.uid}/history`);
                push(historyRef, Object.assign({}, latestResult, { userName: user.displayName || user.email }))
                    .then(() => console.log('Pushed result to user history in Firebase'))
                    .catch(e => console.error('Error pushing to Firebase history:', e));
            } catch (e) {
                console.warn('Could not push to firebase history', e);
            }
            // Also save result to per-user localStorage history
            try {
                const userKey = `quizHistory_${user.uid}`;
                const userHistory = JSON.parse(localStorage.getItem(userKey)) || [];
                // attach user info
                const entry = Object.assign({}, latestResult, { userId: user.uid, userName: user.displayName || user.email });
                userHistory.push(entry);
                localStorage.setItem(userKey, JSON.stringify(userHistory));

                // Remove this entry from the global quizHistory if present (avoid duplicates)
                const globalHistory = JSON.parse(localStorage.getItem('quizHistory')) || [];
                const idx = globalHistory.findIndex(h => h.date === latestResult.date && h.quizPage === latestResult.quizPage && h.percentage === latestResult.percentage);
                if (idx !== -1) {
                    globalHistory.splice(idx, 1);
                    localStorage.setItem('quizHistory', JSON.stringify(globalHistory));
                }
            } catch (e) {
                console.warn('Could not save to per-user local history:', e);
            }
        } else {
            console.warn("No user logged in, Firebase not updated.");
        }
    });

    // Review button: set review mode and navigate back to the quiz page
    if (reviewBtn) {
        reviewBtn.addEventListener('click', (e) => {
            e.preventDefault();
            try {
                localStorage.setItem('reviewMode', 'true');
                const target = quizPage || 'quizhtml1.html';
                // navigate to the quiz page in the same folder
                window.location.href = target;
            } catch (err) {
                console.error('Unable to start review mode', err);
                alert('Unable to open review.');
            }
        });
    }

});
