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
        return budgetedIncome.budgetedIncome;
    }

    return undefined;
};
