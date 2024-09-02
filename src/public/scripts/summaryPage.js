import {
    monthYearToString,
    fetchAllMonthYears,
    fetchTransactionsForMonthYear,
    fetchTopThreeIncomeCategories,
    fetchTopThreeExpenseCategories,
    fetchIncomeCategoriesUnderBudget,
    fetchExpenseCategoriesOverBudget,
} from "./commonPageHelpers.js";

let balancesChart = null;
let savingsRatesChart = null;
let currentMonthYear = null;

document.addEventListener('DOMContentLoaded', async () => {
    const monthYears = await fetchAllMonthYears();

    // Set current month and year to most recent month and year
    currentMonthYear = monthYears[0];
    populateMonthYearDropdown(monthYears);

    await updatePage();
});

const updatePage = async () => {
    const monthYears = await fetchAllMonthYears();
    const matchesCurrentMonthYear = (my) => my.month === currentMonthYear.month && my.year === currentMonthYear.year;
    const currentMonthYearIndex = monthYears.findIndex(matchesCurrentMonthYear);
    const numberOfMonthsToView = 3;
    const lastNMonthYears = monthYears.slice(currentMonthYearIndex, Math.min(currentMonthYearIndex+numberOfMonthsToView, monthYears.length));
    while (lastNMonthYears.length !== numberOfMonthsToView) {
        const oldestMy = lastNMonthYears[lastNMonthYears.length - 1];
        const oldestDate = new Date(`${oldestMy.year}-${oldestMy.month}`);
        const month = (oldestDate.getMonth() + 1).toString().padStart(2, '0');
        const year = oldestDate.getFullYear().toString();
        lastNMonthYears.push({ month, year });
    }
    lastNMonthYears.reverse();


    const lastNMonthsTransactions = await Promise.all(lastNMonthYears.map(async my => {
        return await fetchTransactionsForMonthYear(my);
    }));

    await populateFinancialSnapshotSection();
    await populateBudgetPerformanceSection();

    // Destroy old charts to make canvases available, then render new charts
    if (balancesChart) {
        balancesChart.destroy();
        balancesChart = null;
    }

    if (savingsRatesChart) {
        savingsRatesChart.destroy();
        savingsRatesChart = null;
    }

    balancesChart = renderBalancesChart(lastNMonthsTransactions, lastNMonthYears);
    savingsRatesChart = renderSavingsRatesChart(lastNMonthsTransactions, lastNMonthYears);
};

const renderBalancesChart = (lastNMonthsTransactions, lastNMonthYears) => {
    const budgetPlansSection = document.querySelector('section#balances-chart-section');
    const context = budgetPlansSection.querySelector('canvas#balances-chart').getContext('2d');

    const lastNBalances = lastNMonthsTransactions.map(transactions => {
        const totalIncome = transactions.incomes.reduce((accumulator, income) => {
            accumulator += income.amount;
            return accumulator;
        }, 0);
    
        const totalExpenses = transactions.expenses.reduce((accumulator, expense) => {
            accumulator += expense.amount;
            return accumulator;
        }, 0);
    
        const balance = totalIncome - totalExpenses;
        return balance;
    });

    const labels = lastNMonthYears.map(my => {
        const date = new Date(`${my.year}-${Number(my.month)}`);
        return date.toLocaleString('en-us', { month: 'short' });
    });

    const balancesChart = new Chart(context, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Balance',
                    data: lastNBalances,
                    borderColor: 'rgba(245, 245, 245, 0.3)',
                    backgroundColor: 'rgba(63, 236, 63, 1)',
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        color: '#ffffff',
                        font: {
                            family: 'Poppins',
                            size: 14
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    min: 0,
                    ticks: {
                        color: '#ffffff',
                        callback: function(value) {
                            return value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
                        },
                        font: {
                            family: 'Poppins',
                            size: 16
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    onClick: () => {},
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
                        label: (tooltipItem) => {
                            const amount = tooltipItem.raw.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
                            return `${tooltipItem.dataset.label}: ${amount}`;
                        },
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

    return balancesChart;
};

const renderSavingsRatesChart = (lastNMonthsTransactions, lastNMonthYears) => {
    const budgetPlansSection = document.querySelector('section#savings-rates-chart-section');
    const context = budgetPlansSection.querySelector('canvas#savings-rates-chart').getContext('2d');

    const lastNSavingsRates = lastNMonthsTransactions.map(transactions => {
        const totalIncome = transactions.incomes.reduce((accumulator, income) => {
            accumulator += income.amount;
            return accumulator;
        }, 0);
    
        const totalExpenses = transactions.expenses.reduce((accumulator, expense) => {
            accumulator += expense.amount;
            return accumulator;
        }, 0);
    
        const balance = totalIncome - totalExpenses;
        return totalIncome ? balance / totalIncome * 100.0 : 0.0;
    });

    const labels = lastNMonthYears.map(my => {
        const date = new Date(`${my.year}-${Number(my.month)}`);
        return date.toLocaleString('en-us', { month: 'short' });
    });

    const savingsRatesChart = new Chart(context, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Savings Rate',
                    data: lastNSavingsRates,
                    backgroundColor: 'rgba(63, 236, 63, 1)',
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        color: '#ffffff',
                        font: {
                            family: 'Poppins',
                            size: 14
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    min: 0,
                    max: 100,
                    ticks: {
                        color: '#ffffff',
                        callback: function(value) {
                            return `${value}%`;
                        },
                        font: {
                            family: 'Poppins',
                            size: 16
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    onClick: () => {},
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
                        label: (tooltipItem) => {
                            return `${tooltipItem.dataset.label}: ${tooltipItem.raw.toFixed(2)}%`;
                        },
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

    return savingsRatesChart;
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

const populateFinancialSnapshotSection = async () => {
    const section = document.querySelector('section#financial-snapshot');
    const title = section.querySelector('span#section-title');
    const date = new Date(`${currentMonthYear.year}-${Number(currentMonthYear.month)}`);
    const dateString = date.toLocaleString('en-us', { month: 'long', year: 'numeric' });
    title.textContent = `Monthly Financial Snapshot for ${dateString}`

    const incomeHotspots = section.querySelector('div#income-hotspots ul');
    const topIncomeCategories = await fetchTopThreeIncomeCategories(currentMonthYear);
    const incomeHotspotsChildren = topIncomeCategories.map(category => {
        const li = document.createElement('li');
        li.innerHTML = `
        <b>Category:</b> ${category.categoryName}<br>
        <b>Amount:</b> ${category.totalAmount.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}<br>
        <b>Tips:</b> ${category.tips}<br>
        `;
        return li;
    });

    incomeHotspots.replaceChildren(...incomeHotspotsChildren);

    const expenseHotspots = section.querySelector('div#expense-hotspots ul');
    const topExpenseCategories = await fetchTopThreeExpenseCategories(currentMonthYear);
    const expenseHotspotsChildren = topExpenseCategories.map(category => {
        const li = document.createElement('li');
        li.innerHTML = `
        <b>Category:</b> ${category.categoryName}<br>
        <b>Amount:</b> ${category.totalAmount.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}<br>
        <b>Tips:</b> ${category.tips}<br>
        <br>
        `;
        return li;
    });

    expenseHotspots.replaceChildren(...expenseHotspotsChildren);
};

const populateBudgetPerformanceSection = async () => {
    const section = document.querySelector('section#budget-performance');
    const title = section.querySelector('span#section-title');
    const date = new Date(`${currentMonthYear.year}-${Number(currentMonthYear.month)}`);
    const dateString = date.toLocaleString('en-us', { month: 'long', year: 'numeric' });
    title.textContent = `Budget Performance for ${dateString}`;

    const incomeBudgets = section.querySelector('div#income-budgets');
    const incomeBudgetsHeader = incomeBudgets.querySelector('h4');

    {
        const incomeCategoriesUnderBudget = await fetchIncomeCategoriesUnderBudget(currentMonthYear);
        const lis = incomeCategoriesUnderBudget.map(category => {
            const li = document.createElement('li');
            li.innerHTML = `
            <b>Category:</b> ${category.categoryName}<br>
            <b>Budget:</b> ${category.budgetedAmount.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}<br>
            <b>Actual:</b> ${category.actualAmount.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}<br>
            <b>Tips:</b> ${category.tips}<br>
            <br>
            `;
            return li;
        });

        const ul = document.createElement('ul');
        ul.replaceChildren(...lis);

        const fallback = document.createElement('p');
        fallback.textContent = 'No income categories were under budget this month.';

        const newIncomeBudgetsChildren = [incomeBudgetsHeader, incomeCategoriesUnderBudget.length ? ul : fallback]
        incomeBudgets.replaceChildren(...newIncomeBudgetsChildren);
    }

    const expenseBudgets = section.querySelector('div#expense-budgets');
    const expenseBudgetsHeader = expenseBudgets.querySelector('h4');
    {
        const expenseCategoriesOverBudget = await fetchExpenseCategoriesOverBudget(currentMonthYear);
        const lis = expenseCategoriesOverBudget.map(category => {
            const li = document.createElement('li');
            li.innerHTML = `
            <b>Category:</b> ${category.categoryName}<br>
            <b>Budget:</b> ${category.budgetedAmount.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}<br>
            <b>Actual:</b> ${category.actualAmount.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}<br>
            <b>Tips:</b> ${category.tips}<br>
            <br>
            `;
            return li;
        });

        const ul = document.createElement('ul');
        ul.replaceChildren(...lis);

        const fallback = document.createElement('p');
        fallback.textContent = 'No expense categories were over budget this month.';

        const newExpenseBudgetsChildren = [expenseBudgetsHeader, expenseCategoriesOverBudget.length ? ul : fallback]
        expenseBudgets.replaceChildren(...newExpenseBudgetsChildren);
    }
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
