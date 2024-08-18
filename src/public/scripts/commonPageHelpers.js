export const monthYearToString = (monthYear) => {
    const monthName = Intl.DateTimeFormat('en', { month: 'long' }).format(new Date(monthYear.month));
    return `${monthName} ${monthYear.year}`
};

export const fetchAllMonthYears = async () => {
    const url = 'api/income-months';
    const response = await fetch(url, {
        method: "GET",
    });

    if (response.ok) {
        const dates = await response.json();
        return dates;
    }
};

export const fetchTransactions = async (monthYear) => {
    const url = `api/transactions?month=${monthYear.month}&year=${monthYear.year}`;
    const response = await fetch(url, {
        method: "GET",
    });

    if (response.ok) {
        const transactions = await response.json();
        return transactions;
    }

    return { expenses: [], incomes: [] };
};

export const fetchAllIncomeCategories = async () => {
    const url = 'api/income-categories';
    const response = await fetch(url, {
        method: "GET",
    });

    if (response.ok) {
        const incomeCategories = await response.json();
        return incomeCategories;
    }

    return [];
};

export const fetchBudgetedIncome = async (monthYear) => {
    const url = `api/budgeted-income?month=${monthYear.month}&year=${monthYear.year}`;
    const response = await fetch(url, {
        method: "GET",
    });

    if (response.ok) {
        const budgetedIncome = await response.json();
        return budgetedIncome;
    }

    return undefined;
};

export const fetchBudgetedExpenses = async (monthYear) => {
    const url = `api/budgeted-expenses?month=${monthYear.month}&year=${monthYear.year}`;
    const response = await fetch(url, {
        method: "GET",
    });

    if (response.ok) {
        const budgetedExpenses = await response.json();
        return budgetedExpenses;
    }

    return undefined;
};

export const createTransactionElement = (transaction) => {
    const transactionElement = document.createElement('div');
    transactionElement.classList.add('transaction');

    const transactionIconDiv = document.createElement('div');
    transactionIconDiv.classList.add('transaction-icon');

    const transactionIcon = document.createElement('i');
    transactionIcon.classList.add('fa');
    transactionIcon.classList.add(transaction.icon);

    transactionIconDiv.appendChild(transactionIcon);

    const transactionInfo = document.createElement('div');
    transactionInfo.classList.add('transaction-info');

    const transactionSource = document.createElement('div');
    transactionSource.classList.add('transaction-source');
    transactionSource.textContent = transaction.source;

    const transactionDate = document.createElement('div');
    transactionDate.classList.add('transaction-date');
    transactionDate.textContent = new Date(transaction.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

    transactionInfo.appendChild(transactionSource);
    transactionInfo.appendChild(transactionDate);

    const transactionCategory = document.createElement('div');
    transactionCategory.classList.add('transaction-category');
    transactionCategory.textContent = transaction.category;

    const amountIncome = document.createElement('div');
    amountIncome.classList.add(transaction.type === 'income' ? 'amount-income' : 'amount-expense');
    const plusOrMinus = transaction.type === 'income' ? '+' : '-';
    amountIncome.textContent = `${plusOrMinus}${transaction.amount.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}`;

    transactionElement.appendChild(transactionIconDiv);
    transactionElement.appendChild(transactionInfo);
    transactionElement.appendChild(transactionCategory);
    transactionElement.appendChild(amountIncome);

    return transactionElement;
};