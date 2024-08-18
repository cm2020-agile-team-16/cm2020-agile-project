
let incomeCategoryChart = null;
let incomeChart = null;

document.addEventListener('DOMContentLoaded', async () => {
    const monthYears = await fetchAllMonthYears();
    // Set current month and year to most recent month and year
    const monthYear = monthYears[0];

    const currentTransactions = await fetchTransactions(monthYear);
    const budgetedIncome = await fetchBudgetedIncome(monthYear);
    const incomeCategories = await fetchAllIncomeCategories();
    populateMonthYearDropdown(monthYears);
    populateRecentIncomesList(currentTransactions.incomes);
    incomeCategoryChart = renderIncomeCategoryChart(
        currentTransactions.incomes,
        incomeCategories,
        monthYear
    );
    incomeChart = renderIncomeChart(
        currentTransactions.incomes,
        budgetedIncome,
        monthYear
    );
});

const monthYearToString = (monthYear) => {
    const monthName = Intl.DateTimeFormat('en', { month: 'long' }).format(new Date(monthYear.month));
    return `${monthName} ${monthYear.year}`
};

const fetchAllMonthYears = async () => {
    const url = 'api/income-months';
    const response = await fetch(url, {
        method: "GET",
    });

    if (response.ok) {
        const dates = await response.json();
        return dates;
    }
};

const fetchTransactions = async (monthYear) => {
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

const fetchAllIncomeCategories = async () => {
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

const fetchBudgetedIncome = async (monthYear) => {
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

const renderIncomeCategoryChart = (currentIncomes, incomeCategories, monthYear) => {
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

    const sortedCategoryPercentages = sortedCategoryTotals.map(({name, total}) => ({
        name: name,
        total: (total / totalIncomeBeforeExpenses) * 100,
    }));

    const incomeCategoryChart = new Chart(incomeCategoriesCtx, {
        type: 'bar',
        data: {
            labels: sortedCategoryPercentages.map(category => category.name),
            datasets: [
                {
                    data: sortedCategoryPercentages.map(category => category.total),
                    backgroundColor: 'rgba(63, 236, 63, 1)'
                }
            ]
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
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });

    return incomeCategoryChart;
};

const renderIncomeChart = (currentIncomes, budgetedIncome, monthYear) => {
    const incomeChartSection = document.querySelector('section#income-chart-section');
    const sectionTitle = incomeChartSection.querySelector('span.section-title');
    const incomeCtx = incomeChartSection.querySelector('canvas#income-chart').getContext('2d');

    sectionTitle.textContent = `Income for ${monthYearToString(monthYear)}`;

    const totalIncome = currentIncomes.reduce((accumulator, income) => {
        accumulator += income.amount;
        return accumulator;
    }, 0);

    const incomeChart = new Chart(incomeCtx, {
        type: 'bar',
        data: {
            labels: [''],
            datasets: [
                {
                    label: 'Budgeted',
                    data: [budgetedIncome],
                    backgroundColor: 'rgba(245, 245, 245, 1)',
                    stack: 'stack1'
                },
                {
                    label: 'Actual',
                    data: [totalIncome],
                    backgroundColor: 'rgba(63, 236, 63, 1)',
                    stack: 'stack2'
                }
            ]
        },
        options: {
            responsive: true,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    stacked: true,
                    ticks: {
                        color: '#ffffff',
                        font: {
                            family: 'Poppins',
                            size: 14
                        }
                    }
                },
                y: {
                    stacked: true,
                    ticks: {
                        color: '#ffffff',
                        font: {
                            family: 'Poppins',
                            size: 16
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff',
                        font: {
                            family: 'Poppins',
                            size: 14
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.raw;
                        }
                    },
                    bodyColor: '#ffffff',
                    titleFont: {
                        family: 'Poppins',
                        size: 14
                    },
                    bodyFont: {
                        family: 'Poppins',
                        size: 12
                    }
                }
            }
        }
    });

    return incomeChart;
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
        const monthYear = {
            month: parts[1],
            year: parts[0]
        };
        const currentTransactions = await fetchTransactions(monthYear);
        const budgetedIncome = await fetchBudgetedIncome(monthYear);
        const incomeCategories = await fetchAllIncomeCategories();

        populateRecentIncomesList(currentTransactions.incomes);

        // Destroy old charts to make canvases available, then render new charts
        if (incomeCategoryChart) {
            incomeCategoryChart.destroy();
            incomeCategoryChart = null;
        }

        if (incomeChart) {
            incomeChart.destroy();
            incomeChart = null;
        }

        incomeCategoryChart = renderIncomeCategoryChart(
            currentTransactions.incomes,
            incomeCategories,
            monthYear
        );
        incomeChart = renderIncomeChart(
            currentTransactions.incomes,
            budgetedIncome,
            monthYear
        );
    };

    dropdown.addEventListener('change', onMonthYearDropdownChange);
};

const populateRecentIncomesList = (incomes) => {
    const recentIncomesList = document.querySelector('section#recent-transactions div.transaction-list');

    const createIncomeElement = (transaction) => {
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
        amountIncome.classList.add('amount-income');
        amountIncome.textContent = `+${transaction.amount.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}`;

        transactionElement.appendChild(transactionIconDiv);
        transactionElement.appendChild(transactionInfo);
        transactionElement.appendChild(transactionCategory);
        transactionElement.appendChild(amountIncome);

        return transactionElement;
    };

    const newChildren = incomes.map(income => createIncomeElement(income));
    recentIncomesList.replaceChildren(...newChildren);
};
