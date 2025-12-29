document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('.search-box input');
    const searchBtn = document.querySelector('.search-box button');
    const categorySelect = document.getElementById('categorySelect');
    const levelSelect = document.querySelectorAll('.filter-dropdown select')[1];
    const cards = Array.from(document.querySelectorAll('.quiz-card'));
    const seeMoreBtn = document.getElementById('seeMoreBtn');

    const INITIAL_CARDS = 6; // Initial visible cards
    let cardsToShow = INITIAL_CARDS;

    function updateCards() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = categorySelect.value.toLowerCase();
        const selectedLevel = levelSelect.value.toLowerCase();

        let visibleCount = 0;
        const matchingCards = cards.filter(card => {
            const title = card.querySelector('h3')?.textContent.toLowerCase() || "";
            const category = card.querySelector('.quiz-category')?.textContent.toLowerCase() || "";
            const level = card.querySelector('.quiz-level')?.textContent.toLowerCase() || "";
            return title.includes(searchTerm) &&
                   (selectedCategory === "" || category.includes(selectedCategory)) &&
                   (selectedLevel === "" || level.includes(selectedLevel));
        });

        cards.forEach(card => {
            if (matchingCards.includes(card) && visibleCount < cardsToShow) {
                card.style.display = "block";
                visibleCount++;
            } else {
                card.style.display = "none";
            }
        });

        // Update See More / See Less button
        if (cardsToShow >= matchingCards.length) {
            seeMoreBtn.textContent = "See Less";
        } else {
            seeMoreBtn.textContent = "See More";
        }

        seeMoreBtn.style.display = matchingCards.length > INITIAL_CARDS ? "block" : "none";
    }

    // Filtering event listeners
    searchBtn.addEventListener('click', () => { cardsToShow = INITIAL_CARDS; updateCards(); });
    searchInput.addEventListener('keyup', () => { cardsToShow = INITIAL_CARDS; updateCards(); });
    categorySelect.addEventListener('change', () => { cardsToShow = INITIAL_CARDS; updateCards(); });
    levelSelect.addEventListener('change', () => { cardsToShow = INITIAL_CARDS; updateCards(); });

    // See More / See Less click
    seeMoreBtn.addEventListener('click', () => {
        const matchingCards = cards.filter(card => {
            const title = card.querySelector('h3')?.textContent.toLowerCase() || "";
            const category = card.querySelector('.quiz-category')?.textContent.toLowerCase() || "";
            const level = card.querySelector('.quiz-level')?.textContent.toLowerCase() || "";
            return title.includes(searchInput.value.toLowerCase()) &&
                   (categorySelect.value === "" || category.includes(categorySelect.value.toLowerCase())) &&
                   (levelSelect.value === "" || level.includes(levelSelect.value.toLowerCase()));
        });

        if (cardsToShow >= matchingCards.length) {
            cardsToShow = INITIAL_CARDS; // See Less: collapse
        } else {
            cardsToShow += INITIAL_CARDS; // See More: expand
        }
        updateCards();
    });

    // Initial display
    updateCards();
});
