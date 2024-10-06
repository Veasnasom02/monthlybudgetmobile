document.addEventListener('DOMContentLoaded', function() {
    const expensesTable = document.getElementById('expenses-table').getElementsByTagName('tbody')[0];
    const addExpenseButton = document.getElementById('add-expense');
    const notesListElement = document.getElementById('notes-list');
    const newNoteInput = document.getElementById('new-note');
    const addNoteButton = document.getElementById('add-note');
    const saveButton = document.getElementById('save-button');
    const editButton = document.getElementById('edit-button');
    const printButton = document.getElementById('print-button');
    const clearButton = document.getElementById('clear-button');

    const expenseCategories = [
        'Household', 'Water', 'Gas', 'Wi-fi', 'Electricity',
        'Taxes', 'Groceries', 'Entertainment'
    ];

    function addExpenseRow(category = '') {
        const row = expensesTable.insertRow();
        row.innerHTML = `
            <td><input type="text" value="${category}" placeholder="Category" style="width: 100%;"></td>
            <td><input type="number" placeholder="Budget" onchange="updateTotals()" style="width: 100%;"></td>
            <td><input type="number" placeholder="Actual" onchange="updateTotals()" style="width: 100%;"></td>
            <td>0</td>
            <td class="no-print"><button class="remove-button" onclick="removeExpenseRow(this)">X</button></td>
        `;
    }

    expenseCategories.forEach(addExpenseRow);

    addExpenseButton.addEventListener('click', () => addExpenseRow());

    window.updateTotals = function() {
        let totalBudget = 0;
        let totalActual = 0;

        for (let i = 0; i < expensesTable.rows.length; i++) {
            const row = expensesTable.rows[i];
            const budget = parseFloat(row.cells[1].getElementsByTagName('input')[0].value) || 0;
            const actual = parseFloat(row.cells[2].getElementsByTagName('input')[0].value) || 0;
            const difference = budget - actual;

            totalBudget += budget;
            totalActual += actual;

            row.cells[3].textContent = difference.toFixed(2);
        }

        const totalDifference = totalBudget - totalActual;

        document.getElementById('total-budget').textContent = totalBudget.toFixed(2);
        document.getElementById('total-actual').textContent = totalActual.toFixed(2);
        document.getElementById('total-difference').textContent = totalDifference.toFixed(2);
    }

    window.removeExpenseRow = function(button) {
        const row = button.parentNode.parentNode;
        row.parentNode.removeChild(row);
        updateTotals();
    }

    function addNote(noteText) {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${noteText}</span>
            <button class="remove-button no-print" onclick="removeNote(this)">X</button>
        `;
        notesListElement.appendChild(li);
    }

    addNoteButton.addEventListener('click', function() {
        const noteText = newNoteInput.value.trim();
        if (noteText) {
            addNote(noteText);
            newNoteInput.value = '';
        }
    });

    window.removeNote = function(button) {
        const li = button.parentNode;
        li.parentNode.removeChild(li);
    }

    saveButton.addEventListener('click', function() {
        const data = {
            date: document.getElementById('date').value,
            income: document.getElementById('income').value,
            otherIncome: document.getElementById('other-income').value,
            expenses: Array.from(expensesTable.rows).map(row => ({
                category: row.cells[0].getElementsByTagName('input')[0].value,
                budget: row.cells[1].getElementsByTagName('input')[0].value,
                actual: row.cells[2].getElementsByTagName('input')[0].value
            })),
            notes: Array.from(notesListElement.children).map(li => li.firstElementChild.textContent.trim())
        };
        localStorage.setItem('budgetData', JSON.stringify(data));
        alert('Budget data saved!');
    });

    editButton.addEventListener('click', function() {
        const data = JSON.parse(localStorage.getItem('budgetData'));
        if (data) {
            document.getElementById('date').value = data.date;
            document.getElementById('income').value = data.income;
            document.getElementById('other-income').value = data.otherIncome;

            // Clear existing expenses and notes
            expensesTable.innerHTML = '';
            notesListElement.innerHTML = '';

            // Add saved expenses
            data.expenses.forEach(expense => {
                addExpenseRow(expense.category);
                const row = expensesTable.lastElementChild;
                row.cells[1].getElementsByTagName('input')[0].value = expense.budget;
                row.cells[2].getElementsByTagName('input')[0].value = expense.actual;
            });

            // Add saved notes
            data.notes.forEach(addNote);

            updateTotals();
            alert('Budget data loaded for editing!');
        } else {
            alert('No saved data found!');
        }
    });

    printButton.addEventListener('click', function() {
        window.print();
    });

    clearButton.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear all data?')) {
            localStorage.removeItem('budgetData');
            location.reload();
        }
    });

    // Set current date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
});
