let db;

const request = indexedDB.open('budget-tracker', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_budget', { autoIncrement: true });
};

request.onsuccess = function(event) {
    db = event.target.result;
    if (navigator.online) {
        uploadBudget();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['new_budget'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('new_budget');
    budgetObjectStore.add(record);
};

function uploadBudget() {
    const transaction = db.transaction(['new_budget'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('new_budget');
    const getAll = budgetObjectStore.getAll();
    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(ServerResponse => {
                if (ServerResponse.message) {
                    throw new Error(ServerResponse);
                }
                const transaction = db.transaction(['new_budget'], 'readwrite');
                const budgetObjectStore = transaction.objectStore('new_budget');
                budgetObjectStore.clear();
                alert('All saved changes to transactions saved')
            })
            .catch(err => {
                console.log(err);
            });
        }
    };
};

window.addEventListener('online', uploadBudget);