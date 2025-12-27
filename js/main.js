document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('.search-box input');
    const searchBtn = document.querySelector('.search-box button');
    const categorySelect = document.getElementById('categorySelect');
    const levelSelect = document.querySelectorAll('.filter-dropdown select')[1]; // The level select
    const cards = document.querySelectorAll('.quiz-card');

    function filterQuizzes() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = categorySelect.value.toLowerCase();
        const selectedLevel = levelSelect.value.toLowerCase();

        cards.forEach(card => {
            const title = card.querySelector('h3')?.textContent.toLowerCase() || "";
            const category = card.querySelector('.quiz-category')?.textContent.toLowerCase() || "";
            const level = card.querySelector('.quiz-level')?.textContent.toLowerCase() || "";

            const matchSearch = title.includes(searchTerm);
            const matchCategory = selectedCategory === "" || category.includes(selectedCategory);
            const matchLevel = selectedLevel === "" || level.includes(selectedLevel);

            card.style.display = (matchSearch && matchCategory && matchLevel) ? "block" : "none";
        });
    }
    searchBtn.addEventListener('click', filterQuizzes);   // Search button click
    searchInput.addEventListener('keyup', filterQuizzes); // Search as you type
    categorySelect.addEventListener('change', filterQuizzes); // Category filter
    levelSelect.addEventListener('change', filterQuizzes);    // Level filter
});















