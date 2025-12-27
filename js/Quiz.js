document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('.search-box input');
    const categorySelect = document.getElementById('categorySelect');
    const levelSelect = document.querySelectorAll('.filter-dropdown select')[1];
    const quizzes = Array.from(document.querySelectorAll('.quiz-card'));
    const seeMoreBtn = document.getElementById('seeMoreBtn');

    const initialCount = 6;

    // Function to show quizzes based on a given array and count
    function showQuizzes(filteredQuizzes, count) {
        filteredQuizzes.forEach((quiz, i) => {
            quiz.style.display = i < count ? 'flex' : 'none';
        });
        seeMoreBtn.style.display = filteredQuizzes.length > count ? 'block' : 'none';
    }

    // Filter quizzes based on search, category, and level
    function filterQuizzes() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = categorySelect.value.toLowerCase();
        const selectedLevel = levelSelect.value.toLowerCase();

        const filtered = quizzes.filter(quiz => {
            const title = quiz.querySelector('h3').textContent.toLowerCase();
            const category = quiz.querySelector('.quiz-category').textContent.toLowerCase();
            const level = quiz.querySelector('.quiz-level').textContent.toLowerCase();

            return title.includes(searchTerm) &&
                   (selectedCategory === "" || category === selectedCategory) &&
                   (selectedLevel === "" || level === selectedLevel);
        });

        showQuizzes(filtered, initialCount);
        seeMoreBtn.dataset.filteredCount = filtered.length; // store filtered count
        seeMoreBtn.dataset.visibleCount = initialCount;    // reset visible count
    }

    // Initial display
    filterQuizzes();

    // Event listeners
    [searchInput, categorySelect, levelSelect].forEach(el => {
        el.addEventListener('input', filterQuizzes);
    });

    // See More button
    seeMoreBtn.addEventListener('click', () => {
        let visibleCount = parseInt(seeMoreBtn.dataset.visibleCount);
        const filteredCount = parseInt(seeMoreBtn.dataset.filteredCount);
        const nextCount = visibleCount + initialCount;

        quizzes.forEach((quiz, i) => {
            if(i < nextCount) quiz.style.display = 'flex';
        });

        seeMoreBtn.dataset.visibleCount = nextCount;
        if(nextCount >= filteredCount) seeMoreBtn.style.display = 'none';
    });
});
