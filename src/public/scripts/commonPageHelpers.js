export const monthYearToString = (monthYear) => {
    const monthName = Intl.DateTimeFormat('en', { month: 'long' }).format(new Date(monthYear.month));
    return `${monthName} ${monthYear.year}`
};

export const fetchIncomeMonthYears = async () => {
    const url = 'api/income-month-years';
    const response = await fetch(url, {
        method: "GET",
    });

    if (response.ok) {
        const dates = await response.json();
        return dates;
    }
};

export const fetchExpensesMonthYears = async () => {
    const url = 'api/expenses-month-years';
    const response = await fetch(url, {
        method: "GET",
    });

    if (response.ok) {
        const dates = await response.json();
        return dates;
    }
};

export const fetchAllMonthYears = async () => {
    const incomeMonthYears = await fetchIncomeMonthYears();
    const expensesMonthYears = await fetchExpensesMonthYears();

    const uniqueMonthYears = [...incomeMonthYears, ...expensesMonthYears].reduce((accumulator, monthYear) => {
        if (!accumulator.some(my => my.month === monthYear.month && my.year === monthYear.year)) {
            accumulator.push(monthYear);
        }
        return accumulator;
    }, []);

    const sortedMonthYears = uniqueMonthYears.toSorted((my1, my2) => {
        const date1 = `${my1.year}-${my1.month}`;
        const date2 = `${my2.year}-${my2.month}`;
        return new Date(date2) - new Date(date1);
    });

    return sortedMonthYears;
};

export const fetchTransactionsForMonthYear = async (monthYear) => {
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

export const fetchAllExpenseCategories = async () => {
    const url = 'api/expense-categories';
    const response = await fetch(url, {
        method: "GET",
    });

    if (response.ok) {
        const expenseCategories = await response.json();
        return expenseCategories;
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

export const fetchExpenseLimits = async (monthYear) => {
    const url = `api/expense-limits?month=${monthYear.month}&year=${monthYear.year}`;
    const response = await fetch(url, {
        method: "GET",
    });

    if (response.ok) {
        const expenseLimits = await response.json();
        return expenseLimits;
    }

    return undefined;
};

export const fetchTopThreeIncomeCategories = async (monthYear) => {
    const url = `api/top-income-categories?month=${monthYear.month}&year=${monthYear.year}`;
    const response = await fetch(url, {
        method: "GET",
    });

    if (response.ok) {
        const topIncomeCategories = await response.json();
        return topIncomeCategories;
    }

    return undefined;
};

export const fetchTopThreeExpenseCategories = async (monthYear) => {
    const url = `api/top-expense-categories?month=${monthYear.month}&year=${monthYear.year}`;
    const response = await fetch(url, {
        method: "GET",
    });

    if (response.ok) {
        const topExpenseCategories = await response.json();
        return topExpenseCategories;
    }

    return undefined;
};

export const fetchIncomeCategoriesUnderBudget = async (monthYear) => {
    const url = `api/income-categories-under-budget?month=${monthYear.month}&year=${monthYear.year}`;
    const response = await fetch(url, {
        method: "GET",
    });

    if (response.ok) {
        const incomeCategoriesUnderBudget = await response.json();
        return incomeCategoriesUnderBudget;
    }

    return undefined;
};

export const fetchExpenseCategoriesOverBudget = async (monthYear) => {
    const url = `api/expense-categories-over-budget?month=${monthYear.month}&year=${monthYear.year}`;
    const response = await fetch(url, {
        method: "GET",
    });

    if (response.ok) {
        const expenseCategoriesOverBudget = await response.json();
        return expenseCategoriesOverBudget;
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