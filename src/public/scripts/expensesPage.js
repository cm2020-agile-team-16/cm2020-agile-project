import {
    monthYearToString,
    fetchExpensesMonthYears,
    fetchTransactionsForMonthYear,
    fetchAllExpenseCategories,
    fetchExpenseLimits,
    createTransactionElement,
} from "./commonPageHelpers.js";


let expenseCategoryChart = null;
let currentMonthYear = null;

document.addEventListener('DOMContentLoaded', async () => {
    const expenseMonthYears = await fetchExpensesMonthYears();
    const expenseCategories = await fetchAllExpenseCategories();
    // Set current month and year to most recent month and year
    currentMonthYear = expenseMonthYears[0];
    populateMonthYearDropdown(expenseMonthYears);
    populateAddExpenseDialogExpenseCategoryDropdown(expenseCategories);
    populateSetLimitDialogExpenseCategoryDropdown(expenseCategories);

    await updatePage();
});

const updatePage = async () => {
    const currentTransactions = await fetchTransactionsForMonthYear(currentMonthYear);
    const expenseLimits = await fetchExpenseLimits(currentMonthYear);
    const expenseCategories = await fetchAllExpenseCategories();

    populateRecentExpensesList(currentTransactions.expenses);

    // Destroy old chart to make canvas available, then render new chart
    if (expenseCategoryChart) {
        expenseCategoryChart.destroy();
        expenseCategoryChart = null;
    }

    expenseCategoryChart = renderExpenseCategoryChart(
        currentTransactions.expenses,
        expenseCategories,
        expenseLimits,
        currentMonthYear
    );
};

const renderExpenseCategoryChart = (
    currentExpenses,
    expenseCategories,
    expenseLimits,
    monthYear,
) => {
    const categoryChartSection = document.querySelector('section#expense-categories-chart-section');
    const sectionTitle = categoryChartSection.querySelector('span.section-title');
    const expenseCategoriesCtx = categoryChartSection.querySelector('canvas#expense-categories-chart').getContext('2d');

    sectionTitle.textContent = `Expense Categories for ${monthYearToString(monthYear)}`;

    const categoryTotals = currentExpenses.reduce((accumulator, expense) => {
        if (accumulator[expense.category]) {
            // Category already exists in accumulator
            accumulator[expense.category] += expense.amount;
        } else {
            accumulator[expense.category] = expense.amount;
        }
        return accumulator;
    }, Object.fromEntries(expenseCategories.map(c => [c.name, 0])));

    const categoryTotalsMap = new Map(Object.entries(categoryTotals));

    const sortedCategoryTotals = [...categoryTotalsMap]
        .toSorted((a, b) => b[1] - a[1])
        .map(([name, total]) => ({
            name,
            total
        }));

    const defaultExpenseCategoryLimitMap = expenseCategories.reduce((accumulator, category) => {
        accumulator[category.name] = 0;
        return accumulator;
    }, {});

    const expenseCategoryLimitMap = expenseLimits.reduce((accumulator, limit) => {
        accumulator[limit.category] = limit.amount;
        return accumulator;
    }, defaultExpenseCategoryLimitMap);

    const expenseCategoryChart = new Chart(expenseCategoriesCtx, {
        type: 'bar',
        data: {
            labels: sortedCategoryTotals.map(category => category.name),
            datasets: [
                {
                    label: 'Actual',
                    data: sortedCategoryTotals.map(category => category.total),
                    backgroundColor: 'rgba(252, 51, 51, 1)',
                },
                {
                    label: 'Limit',
                    data: sortedCategoryTotals.map(category => expenseCategoryLimitMap[category.name]),
                    backgroundColor: 'rgba(245, 245, 245, 1)',
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    onClick: () => {},
                    display: false,
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    min: 0,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    onClick: () => {},
                },
                tooltip: {
                    callbacks: {
                        label: (tooltipItem) => {
                            const amount = tooltipItem.raw.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
                            return `${tooltipItem.dataset.label}: ${amount}`;
                        },
                    },
                },
            },
        }
    });

    return expenseCategoryChart;
};

const populateMonthYearDropdown = (monthYears) => {
    const dropdown = document.querySelector('select#month-year-dropdown');
    monthYears.forEach(monthYear => {
        const option = document.createElement('option');
        option.value = `${monthYear.year}-${monthYear.month}`;
        option.text = monthYearToString(monthYear)
        dropdown.appendChild(option);
    });
};


export const onChangeMonthYearDropdown = async (element) => {
    // When the user selects a new month/year from the dropdown
    // Update all HTML elements that care about month/date
    const parts = element.value.split('-');
    currentMonthYear = {
        month: parts[1],
        year: parts[0]
    };

    await updatePage();
};

const populateAddExpenseDialogExpenseCategoryDropdown = (expenseCategories) => {
    const dropdown = document.querySelector('dialog#add-expense-dialog select#add-expense-dialog-category');
    expenseCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.text = category.name;
        dropdown.appendChild(option);
    });
};

const populateSetLimitDialogExpenseCategoryDropdown = (expenseCategories) => {
    const dropdown = document.querySelector('dialog#set-limit-dialog select#set-limit-dialog-category');
    expenseCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.text = category.name;
        dropdown.appendChild(option);
    });
};

const populateRecentExpensesList = (expenses, filter=undefined, sortKey='latest') => {
    const recentExpensesList = document.querySelector('section#recent-transactions div.transaction-list');
    const sortFunc = (expense1, expense2) => {
        if (sortKey === 'latest' || sortKey == 'oldest') {
            return new Date(expense2) - new Date(expense1);
        } else if (sortKey === 'amount-desc') {
            return expense2.amount - expense1.amount;
        } else if (sortKey === 'amount-asc') {
            return expense1.amount - expense2.amount;
        }
    };
    let sortedFilteredExpenses = expenses
        .filter(expense => filter ? expense.source.includes(filter) : true)
        .toSorted(sortFunc)
    if (sortKey === 'oldest') {
        sortedFilteredExpenses = [...sortedFilteredExpenses].reverse();
    }
    const newChildren = sortedFilteredExpenses.map(expense => createTransactionElement(expense));
    recentExpensesList.replaceChildren(...newChildren);
};

export const onClickAddExpenseButton = (element, event) => {
    const dialog = document.querySelector('dialog#add-expense-dialog');
    dialog.showModal();
};

const clickedOutsideDialog = (element, event) => {
    const rect = element.getBoundingClientRect();
    const isInY = (rect.top <= event.clientY && event.clientY <= rect.top + rect.height);
    const isInX = (rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
    const isInDialog = isInY && isInX;
    return !isInDialog;
};

export const onClickAddExpenseDialogCloseButton = () => {
    const dialog = document.querySelector('dialog#add-expense-dialog');
    dialog.close();
};

export const onClickAddExpenseDialog = (element, event) => {
    if (clickedOutsideDialog(element, event)) {
        element.close();
    }
};

export const onKeyDownAddExpenseDialog = (element, event) => {
    if (event.key === 'Escape') {
        element.close();
    }
};

export const onClickSetLimitButton = (element, event) => {
    const dialog = document.querySelector('dialog#set-limit-dialog');
    dialog.showModal();
};

export const onClickSetLimitDialogCloseButton = () => {
    const dialog = document.querySelector('dialog#set-limit-dialog');
    dialog.close();
};

export const onClickSetLimitDialog = (element, event) => {
    if (clickedOutsideDialog(element, event)) {
        element.close();
    }
};

export const onKeyDownSetLimitDialog = (element, event) => {
    if (event.key === 'Escape') {
        element.close();
    }
};

export const onKeyDownSearchBar = async (element, event) => {
    if (event.key === 'Enter') {
        const filter = element.value;
        await filterRecentExpensesList(filter);
    }
};

export const onClickSearchBarFilterButton = async () => {
    const searchBar = document.querySelector('section#search input#search-bar');
    const filter = searchBar.value;
    await filterRecentExpensesList(filter);
};

const filterRecentExpensesList = async (filter) => {
    const sortDropdown = document.querySelector('section#recent-transactions select.dropdown');
    const sortKey = sortDropdown.value;
    const currentTransactions = await fetchTransactionsForMonthYear(currentMonthYear);
    populateRecentExpensesList(currentTransactions.expenses, filter, sortKey);
};

export const onChangeSortDropdown = async (element) => {
    const searchBar = document.querySelector('section#search input#search-bar');
    const filter = searchBar.value;
    const sortKey = element.value;
    const currentTransactions = await fetchTransactionsForMonthYear(currentMonthYear);
    populateRecentExpensesList(currentTransactions.expenses, filter, sortKey);
};