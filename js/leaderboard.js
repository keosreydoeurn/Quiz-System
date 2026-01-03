import { app } from "./firebase.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const db = getDatabase(app);
const leaderboardBody = document.getElementById("leaderboardBody");

console.log('[Leaderboard] script loaded. leaderboardBody exists:', !!leaderboardBody);
try {
    console.log('[Leaderboard] localStorage keys:', Array.from({ length: localStorage.length }).map((_, i) => localStorage.key(i)));
} catch (e) {
    console.warn('[Leaderboard] unable to read localStorage keys', e);
}
let currentData = [];
let sortConfig = { field: 'score', direction: 'desc' };

function renderPodium(entries) {
    const podiumCards = document.querySelectorAll('.podium-card');
    if (!podiumCards || podiumCards.length < 3) return;
    
    const top3 = entries.slice(0, 3);
    const podiumOrder = [1, 0, 2]; // Order: 2nd, 1st, 3rd
    
    podiumOrder.forEach((origIdx, podiumPos) => {
        if (top3[origIdx]) {
            const entry = top3[origIdx];
            const card = podiumCards[podiumPos];
            const rank = origIdx + 1;
            card.innerHTML = `
                <div class="rank">${rank}</div>
                <div style="width: 80px; height: 80px; margin: 10px auto; background: #ccc; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-user" style="font-size: 40px;"></i>
                </div>
                <h3>${entry.name}</h3>
                <p>${entry.percentage}% - ${entry.total} Quizzes</p>
            `;
        }
    });
}

function sortData(field) {
    if (sortConfig.field === field) {
        sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
        sortConfig.field = field;
        sortConfig.direction = 'desc';
    }
    
    currentData.sort((a, b) => {
        let aVal, bVal;
        
        if (field === 'name') {
            aVal = a.name.toLowerCase();
            bVal = b.name.toLowerCase();
            return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        } else if (field === 'score') {
            aVal = a.score;
            bVal = b.score;
        } else if (field === 'total') {
            aVal = a.total;
            bVal = b.total;
        } else if (field === 'date') {
            aVal = new Date(a.date || 0).getTime();
            bVal = new Date(b.date || 0).getTime();
        }
        
        if (sortConfig.direction === 'asc') {
            return aVal - bVal;
        } else {
            return bVal - aVal;
        }
    });
    
    renderRows(currentData);
    updateSortIndicators(field);
}


function updateSortIndicators(activeField) {
    document.querySelectorAll('th.sortable').forEach(th => {
        const icon = th.querySelector('i');
        const field = th.getAttribute('data-sort');
        if (field === activeField) {
            icon.className = sortConfig.direction === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
        } else {
            icon.className = 'fas fa-sort';
        }
    });
}

function renderRows(rows) {
    if (!leaderboardBody) return;
    leaderboardBody.innerHTML = "";
    
    if (!rows || rows.length === 0) {
        leaderboardBody.innerHTML = "<tr><td colspan='4'>No data yet</td></tr>";
        return;
    }

    rows.forEach((u, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${u.name}</td>
            <td>${u.score}%</td>
            <td>${u.total}</td>
        `;
        leaderboardBody.appendChild(row);
    });
}

function aggregateData(history) {
    const grouped = {};
    
    history.forEach((r, i) => {
        const name = r.name || `User ${i + 1}`;
        if (!grouped[name]) {
            grouped[name] = {
                name: name,
                scores: [],
                dates: []
            };
        }
        grouped[name].scores.push(r.percentage ?? 0);
        if (r.date) grouped[name].dates.push(r.date);
    });
    
    return Object.values(grouped).map(g => ({
        name: g.name,
        score: Math.round(g.scores.reduce((a, b) => a + b, 0) / g.scores.length),
        percentage: Math.round(g.scores.reduce((a, b) => a + b, 0) / g.scores.length),
        total: g.scores.length,
        date: g.dates[g.dates.length - 1] || '-'
    }));
}

function renderFromLocalHistory() {
    console.log('[Leaderboard] scanning localStorage for quizHistory keys...');
    // Collect per-user histories from localStorage keys and other common result keys
    const entries = [];

    // include explicit leaderboardData key (used by add form)
    try {
        const saved = JSON.parse(localStorage.getItem('leaderboardData') || '[]');
        if (saved && saved.length) {
            saved.forEach(s => {
                entries.push({ name: s.name, score: s.score, percentage: s.score, total: s.total, date: s.date || '-' });
            });
        }
    } catch (e) {
        console.warn('[Leaderboard] invalid leaderboardData', e);
    }

    const genericPattern = /(quizhistory|quiz_history|quizHistory|history|results|result|quizresults|userResults|userQuizzes|leaderboardData)/i;

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;

        // existing quizHistory handling (keeps previous behavior)
        if (key === 'quizHistory' || key.startsWith('quizHistory_')) {
            console.log('[Leaderboard] found history key:', key);
            try {
                const hist = JSON.parse(localStorage.getItem(key)) || [];
                console.log('[Leaderboard]   entries count for', key, ':', hist.length);
                if (hist.length === 0) continue;
                if (key === 'quizHistory') {
                    const agg = aggregateData(hist.map(r => Object.assign({}, r, { name: r.userName || 'Guest' })));
                    entries.push(...agg);
                } else {
                    const name = hist[hist.length - 1].userName || key.split('quizHistory_')[1];
                    const agg = aggregateData(hist.map(r => Object.assign({}, r, { name })));
                    entries.push(...agg);
                }
            } catch (e) {
                console.warn('Invalid history key', key, e);
            }
            continue;
        }

        // generic key scanning: try to parse arrays/objects that may contain results
        if (genericPattern.test(key)) {
            try {
                const val = JSON.parse(localStorage.getItem(key));
                if (!val) continue;

                if (Array.isArray(val) && val.length) {
                    val.forEach(item => {
                        if (!item) return;
                        const name = item.name || item.userName || item.displayName || key;
                        const score = item.percentage ?? item.score ?? item.lastScore ?? null;
                        const total = item.total ?? item.totalQuestions ?? 1;
                        const date = item.date || item.timestamp || '-';
                        if (score !== null) entries.push({ name, score, percentage: score, total, date });
                    });
                } else if (typeof val === 'object' && Object.keys(val).length) {
                    // single object that may contain result fields
                    const name = val.name || val.userName || val.displayName || key;
                    const score = val.percentage ?? val.score ?? val.lastScore ?? null;
                    const total = val.total ?? val.totalQuestions ?? 1;
                    const date = val.date || val.timestamp || '-';
                    if (score !== null) entries.push({ name, score, percentage: score, total, date });
                }
            } catch (e) {
                // ignore non-JSON entries
            }
        }
    }

    console.log('[Leaderboard] aggregated entries from localStorage:', entries.length);
    if (entries.length === 0) {
        // No local data found: seed localStorage with sample data so page shows entries automatically
        console.log('[Leaderboard] No local quiz history found. Seeding sample leaderboardData.');
        const sample = [
            { name: 'Alice', score: 95, percentage: 95, total: 10, date: '2025-12-01' },
            { name: 'Bob', score: 92, percentage: 92, total: 8, date: '2025-11-28' },
            { name: 'Carol', score: 89, percentage: 89, total: 12, date: '2025-11-20' }
        ];
        try {
            localStorage.setItem('leaderboardData', JSON.stringify(sample));
        } catch (e) {
            console.warn('[Leaderboard] unable to persist sample data', e);
        }
        currentData = sample.slice();
        renderPodium(currentData);
        renderRows(currentData);
        setupSortHandlers();
        return;
    }

    // entries may contain multiple aggregated rows; merge by name
    const merged = {};
    entries.forEach(e => {
        if (!merged[e.name]) merged[e.name] = { name: e.name, scores: [], totals: 0, dates: [] };
        // use e.score as average for that group; for merging, approximate by pushing score multiple times by total
        for (let k = 0; k < (e.total || 1); k++) merged[e.name].scores.push(e.score || 0);
        merged[e.name].totals += e.total || 1;
        if (e.date && e.date !== '-') merged[e.name].dates.push(e.date);
    });

    currentData = Object.values(merged).map(m => ({
        name: m.name,
        score: Math.round(m.scores.reduce((a, b) => a + b, 0) / Math.max(1, m.scores.length)),
        percentage: Math.round(m.scores.reduce((a, b) => a + b, 0) / Math.max(1, m.scores.length)),
        total: m.totals,
        date: m.dates.sort().slice(-1)[0] || '-'
    }));

    currentData.sort((a, b) => b.score - a.score);
    renderPodium(currentData);
    renderRows(currentData);
    setupSortHandlers();
}

// --- Add result form handling (saves to localStorage 'leaderboardData') ---
function initAddResultForm() {
    const form = document.getElementById('addResultForm');
    if (!form) return;

    const inName = document.getElementById('resName');
    const inScore = document.getElementById('resScore');
    const inTotal = document.getElementById('resTotal');

    function updateLivePreview() {
        if (!leaderboardBody) return;
        const name = (inName.value || '').trim();
        const scoreVal = inScore.value;
        const totalVal = inTotal.value;
        const score = scoreVal !== '' ? parseInt(scoreVal, 10) : null;
        const total = totalVal !== '' ? parseInt(totalVal, 10) : null;

        // remove existing preview row
        const existing = leaderboardBody.querySelector('tr.preview-row');
        if (existing) existing.remove();

        // if no input, nothing to preview
        if (!name && score === null && total === null) return;

        const tr = document.createElement('tr');
        tr.className = 'preview-row';
        tr.innerHTML = `
            <td>—</td>
            <td>${name || '—'}</td>
            <td>${score !== null ? score + '%' : '—'}</td>
            <td>${total !== null ? total : '—'}</td>
        `;
        leaderboardBody.insertBefore(tr, leaderboardBody.firstChild);
    }

    // attach live input handlers
    [inName, inScore, inTotal].forEach(el => {
        if (el) el.addEventListener('input', updateLivePreview);
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = (document.getElementById('resName').value || '').trim();
        const score = parseInt(document.getElementById('resScore').value, 10) || 0;
        const total = parseInt(document.getElementById('resTotal').value, 10) || 1;
        const date = new Date().toISOString().slice(0, 10);

        try {
            const list = JSON.parse(localStorage.getItem('leaderboardData') || '[]');
            list.push({ name, score, total, date });
            localStorage.setItem('leaderboardData', JSON.stringify(list));
            console.log('[Leaderboard] saved entry to leaderboardData', { name, score, total, date });
        } catch (err) {
            console.error('[Leaderboard] error saving leaderboardData', err);
        }

        // re-render from localStorage
        renderFromLocalHistory();
        // clear form and remove preview
        try { form.reset(); } catch (e) {}
        const existing = leaderboardBody.querySelector('tr.preview-row');
        if (existing) existing.remove();
    });
}


// initialize add form after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initAddResultForm();
    // Ensure leaderboard shows automatically by scanning localStorage immediately
    try { renderFromLocalHistory(); } catch (e) { console.warn('[Leaderboard] renderFromLocalHistory failed on load', e); }
});

function renderFromFirebase(leaderboard) {
    currentData = leaderboard.map(u => ({
        name: u.id,
        score: u.percentage ?? 0,
        percentage: u.percentage ?? 0,
        total: u.totalQuestions ?? 0,
        date: u.date || '-'
    }));
    
    renderPodium(currentData);
    renderRows(currentData);
    setupSortHandlers();
}

function setupSortHandlers() {
    document.querySelectorAll('th.sortable').forEach(th => {
        th.style.cursor = 'pointer';
        th.addEventListener('click', () => {
            const field = th.getAttribute('data-sort');
            sortData(field);
        });
    });
}

const usersRef = ref(db, "users");

get(usersRef).then((snapshot) => {
    const users = snapshot.val();
    console.log('[Leaderboard] Firebase users snapshot:', users ? Object.keys(users).length : 0);
    const leaderboard = [];

    if (users) {
        for (const uid in users) {
            const user = users[uid];
            // derive stats from saved results or history
            const id = user.displayName || uid;
            if (user.history) {
                const items = Object.values(user.history);
                const total = items.length;
                const avg = total === 0 ? 0 : Math.round(items.reduce((s, it) => s + (it.percentage || 0), 0) / total);
                const lastDate = items.length ? (items[items.length - 1].date || '-') : '-';
                leaderboard.push({ id, score: avg, percentage: avg, totalQuestions: total, date: lastDate });
            } else if (user.results && user.results.lastScore !== undefined) {
                leaderboard.push({
                    id,
                    score: user.results.lastScore,
                    percentage: user.results.percentage ?? 0,
                    totalQuestions: user.results.totalQuestions ?? 0,
                    date: user.results.date || '-'
                });
            }
        }
    }

    if (leaderboard.length === 0) {
        console.log('[Leaderboard] No Firebase data, using local history.');
        renderFromLocalHistory();
        return;
    }

    leaderboard.sort((a, b) => b.score - a.score);
    console.log('[Leaderboard] Firebase data:', leaderboard);
    
    renderFromFirebase(leaderboard);

}).catch(err => {
    console.error("Error loading leaderboard:", err);
    console.log('[Leaderboard] Firebase error, using local history.');
    renderFromLocalHistory();
});
