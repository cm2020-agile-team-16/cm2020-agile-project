import {
    monthYearToString,
    fetchIncomeMonthYears,
    fetchTransactionsForMonthYear,
    fetchAllIncomeCategories,
    fetchBudgetedIncome,
    createTransactionElement,
} from "./commonPageHelpers.js";


let incomeCategoryChart = null;
let currentMonthYear = null;

document.addEventListener('DOMContentLoaded', async () => {
    const incomeMonthYears = await fetchIncomeMonthYears();
    const incomeCategories = await fetchAllIncomeCategories();
    // Set current month and year to most recent month and year
    currentMonthYear = incomeMonthYears[0];
    populateMonthYearDropdown(incomeMonthYears);
    populateAddIncomeDialogIncomeCategoryDropdown(incomeCategories);
    populateSetBudgetDialogIncomeCategoryDropdown(incomeCategories);

    await updatePage();
});

const updatePage = async () => {
    const currentTransactions = await fetchTransactionsForMonthYear(currentMonthYear);
    const budgetedIncome = await fetchBudgetedIncome(currentMonthYear);
    const incomeCategories = await fetchAllIncomeCategories();

    populateRecentIncomesList(currentTransactions.incomes);

    // Destroy old charts to make canvases available, then render new charts
    if (incomeCategoryChart) {
        incomeCategoryChart.destroy();
        incomeCategoryChart = null;
    }

    incomeCategoryChart = renderIncomeCategoryChart(
        currentTransactions.incomes,
        incomeCategories,
        budgetedIncome,
        currentMonthYear
    );
};

const renderIncomeCategoryChart = (
    currentIncomes,
    incomeCategories,
    budgetedIncome,
    monthYear,
) => {
    const categoryChartSection = document.querySelector('section#income-categories-chart-section');
    const sectionTitle = categoryChartSection.querySelector('span.section-title');
    const incomeCategoriesCtx = categoryChartSection.querySelector('canvas#income-categories-chart').getContext('2d');

    sectionTitle.textContent = `Income Categories for ${monthYearToString(monthYear)}`;

    const categoryTotals = currentIncomes.reduce((accumulator, income) => {
        if (accumulator[income.category]) {
            // Category already exists in accumulator
            accumulator[income.category] += income.amount;
        } else {
            accumulator[income.category] = income.amount;
        }
        return accumulator;
    }, Object.fromEntries(incomeCategories.map(c => [c.name, 0])));

    const categoryTotalsMap = new Map(Object.entries(categoryTotals));

    const sortedCategoryTotals = [...categoryTotalsMap]
        .toSorted((a, b) => b[1] - a[1])
        .map(([name, total]) => ({
            name,
            total
        }));
    
    const totalIncomeBeforeExpenses = sortedCategoryTotals.reduce((sum, category) => {
        return sum + category.total;
    }, 0);

    const defaultIncomeCategoryBudgetMap = incomeCategories.reduce((accumulator, category) => {
        accumulator[category.name] = 0;
        return accumulator;
    }, {});

    const incomeCategoryBudgetMap = budgetedIncome.reduce((accumulator, budget) => {
        accumulator[budget.category] = budget.amount;
        return accumulator;
    }, defaultIncomeCategoryBudgetMap);

    const incomeCategoryChart = new Chart(incomeCategoriesCtx, {
        type: 'bar',
        data: {
            labels: sortedCategoryTotals.map(category => category.name),
            datasets: [
                {
                    label: 'Actual',
                    data: sortedCategoryTotals.map(category => category.total),
                    backgroundColor: 'rgba(63, 236, 63, 1)',
                },
                {
                    label: 'Budgeted',
                    data: sortedCategoryTotals.map(category => incomeCategoryBudgetMap[category.name]),
                    backgroundColor: 'rgba(245, 245, 245, 1)',
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
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

    return incomeCategoryChart;
};

const populateMonthYearDropdown = (monthYears) => {
    const dropdown = document.querySelector('select#month-year-dropdown');
    monthYears.forEach(monthYear => {
        const option = document.createElement('option');
        option.value = `${monthYear.year}-${monthYear.month}`;
        option.text = monthYearToString(monthYear)
        dropdown.appendChild(option);
    });

    const onMonthYearDropdownChange = async () => {
        // When the user selects a new month/year from the dropdown
        // Update all HTML elements that care about month/date
        const parts = dropdown.value.split('-');
        currentMonthYear = {
            month: parts[1],
            year: parts[0]
        };

        await updatePage();
    };

    dropdown.addEventListener('change', onMonthYearDropdownChange);
};

const populateAddIncomeDialogIncomeCategoryDropdown = (incomeCategories) => {
    const dropdown = document.querySelector('dialog#add-income-dialog select#add-income-dialog-category');
    incomeCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.text = category.name;
        dropdown.appendChild(option);
    });
};

const populateSetBudgetDialogIncomeCategoryDropdown = (incomeCategories) => {
    const dropdown = document.querySelector('dialog#set-budget-dialog select#set-budget-dialog-category');
    incomeCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.text = category.name;
        dropdown.appendChild(option);
    });
};

const populateRecentIncomesList = (incomes, filter=undefined) => {
    const recentIncomesList = document.querySelector('section#recent-transactions div.transaction-list');
    const newChildren = incomes.filter(income => filter ? income.source.includes(filter) : true).map(income => createTransactionElement(income));
    recentIncomesList.replaceChildren(...newChildren);
};

export const onClickAddIncomeButton = (element, event) => {
    const dialog = document.querySelector('dialog#add-income-dialog');
    dialog.showModal();
};

const clickedOutsideDialog = (element, event) => {
    const rect = element.getBoundingClientRect();
    const isInY = (rect.top <= event.clientY && event.clientY <= rect.top + rect.height);
    const isInX = (rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
    const isInDialog = isInY && isInX;
    return !isInDialog;
};

export const onClickAddIncomeDialogCloseButton = () => {
    const dialog = document.querySelector('dialog#add-income-dialog');
    dialog.close();
};

export const onClickAddIncomeDialog = (element, event) => {
    if (clickedOutsideDialog(element, event)) {
        element.close();
    }
};

export const onKeyDownAddIncomeDialog = (element, event) => {
    if (event.key === 'Escape') {
        element.close();
    }
};

export const onClickSetBudgetButton = (element, event) => {
    const dialog = document.querySelector('dialog#set-budget-dialog');
    dialog.showModal();
};

export const onClickSetBudgetDialogCloseButton = () => {
    const dialog = document.querySelector('dialog#set-budget-dialog');
    dialog.close();
};

export const onClickSetBudgetDialog = (element, event) => {
    if (clickedOutsideDialog(element, event)) {
        element.close();
    }
};

export const onKeyDownSetBudgetDialog = (element, event) => {
    if (event.key === 'Escape') {
        element.close();
    }
};

export const onKeyDownSearchBar = async (element, event) => {
    if (event.key === 'Enter') {
        const text = element.value;
        await filterRecentIncomesList(text);
    }
};

export const onClickSearchBarFilterButton = async () => {
    const searchBar = document.querySelector('section#search input#search-bar');
    const text = searchBar.value;
    await filterRecentIncomesList(text);
};

const filterRecentIncomesList = async (text) => {
    const currentTransactions = await fetchTransactionsForMonthYear(currentMonthYear);
    populateRecentIncomesList(currentTransactions.incomes, text);
};
