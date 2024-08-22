import {
    monthYearToString,
    fetchIncomeMonthYears,
    fetchExpensesMonthYears,
    fetchTransactionsForMonthYear,
    fetchBudgetedIncome,
    fetchExpenseLimits,
    createTransactionElement,
} from "./commonPageHelpers.js";


let incomesChart = null;
let expensesChart = null;

document.addEventListener('DOMContentLoaded', async () => {
    const incomeMonthYears = await fetchIncomeMonthYears();
    const expensesMonthYears = await fetchExpensesMonthYears();
    // Join the two arrays of monthYears, sort by date
    const monthYears = [...incomeMonthYears, ...expensesMonthYears].toSorted((my1, my2) => {
        const date1 = `${my1.year}-${my1.month}`;
        const date2 = `${my2.year}-${my2.month}`;
        return new Date(date2) - new Date(date1);
    });

    // Set current month and year to most recent month and year
    const monthYear = monthYears[0];

    const currentTransactions = await fetchTransactionsForMonthYear(monthYear);
    const budgetedIncomesThisMonth = await fetchBudgetedIncome(monthYear);
    const expenseLimitsThisMonth = await fetchExpenseLimits(monthYear);

    const totalBudgetedIncome = budgetedIncomesThisMonth.reduce((accumulator, budget) => {
        accumulator += budget.amount;
        return accumulator;
    }, 0);

    const totalExpenseLimits = expenseLimitsThisMonth.reduce((accumulator, limit) => {
        accumulator += limit.amount;
        return accumulator;
    }, 0);

    await updatePage(
        currentTransactions,
        totalBudgetedIncome,
        totalExpenseLimits,
        monthYear,
    );
});

const updatePage = async (
    currentTransactions,
    totalBudgetedIncome,
    totalExpenseLimits,
    monthYear,
) => {
    const allTransactions = [...currentTransactions.incomes, ...currentTransactions.expenses];
    const sortedTransactions = allTransactions.toSorted((t1, t2) => new Date(t2.date) - new Date(t1.date));
    const threeMostRecent = sortedTransactions.slice(0, 3);

    populateBalanceCard(currentTransactions, monthYear);
    populateBudgetPlansSection(monthYear);
    populateRecentTransactionsList(threeMostRecent);

    // Destroy old charts to make canvases available, then render new charts
    if (incomesChart) {
        incomesChart.destroy();
        incomesChart = null;
    }

    if (expensesChart) {
        expensesChart.destroy();
        expensesChart = null;
    }

    incomesChart = renderIncomesChart(
        currentTransactions.incomes,
        totalBudgetedIncome,
    );

    expensesChart = renderExpensesChart(
        currentTransactions.expenses,
        totalExpenseLimits,
    );
};

const renderIncomesChart = (currentIncomes, totalBudgetedIncome) => {
    const budgetPlansSection = document.querySelector('section#budget-plans-section');
    const context = budgetPlansSection.querySelector('canvas#incomes-chart').getContext('2d');

    const totalIncome = currentIncomes.reduce((accumulator, income) => {
        accumulator += income.amount;
        return accumulator;
    }, 0);

    const incomesChart = new Chart(context, {
        type: 'bar',
        data: {
            labels: [''],
            datasets: [
                {
                    label: 'Budgeted',
                    data: [totalBudgetedIncome],
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

    return incomesChart;
};

const renderExpensesChart = (currentExpenses, totalExpenseLimits) => {
    const budgetPlansSection = document.querySelector('section#budget-plans-section');
    const context = budgetPlansSection.querySelector('canvas#expenses-chart').getContext('2d');

    const totalExpenses = currentExpenses.reduce((accumulator, expense) => {
        accumulator += expense.amount;
        return accumulator;
    }, 0);

    const expensesChart = new Chart(context, {
        type: 'bar',
        data: {
            labels: [''],
            datasets: [
                {
                    label: 'Limit',
                    data: [totalExpenseLimits],
                    backgroundColor: 'rgba(245, 245, 245, 1)',
                    stack: 'stack1'
                },
                {
                    label: 'Actual',
                    data: [totalExpenses],
                    backgroundColor: 'rgba(252, 51, 51, 1)',
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

    return expensesChart;
};

const populateBalanceCard = (currentTransactions, monthYear) => {
    const balanceCardSection = document.querySelector('section#balance-card');

    const balanceText = balanceCardSection.querySelector('div#balance span#balance-text');
    balanceText.textContent = `Balance for ${monthYearToString(monthYear)}`;

    const totalIncome = currentTransactions.incomes.reduce((accumulator, income) => {
        accumulator += income.amount;
        return accumulator;
    }, 0);

    const totalExpenses = currentTransactions.expenses.reduce((accumulator, expense) => {
        accumulator += expense.amount;
        return accumulator;
    }, 0);

    const balance = totalIncome - totalExpenses;
    const balanceAmount = balanceCardSection.querySelector('div#balance span#balance-amount');
    balanceAmount.textContent = balance.toLocaleString("en-US", { style: "currency", currency: "USD" });

    const totalIncomeAmount = balanceCardSection.querySelector('div#income span#amount');
    totalIncomeAmount.textContent = totalIncome.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })

    const totalExpensesAmount = balanceCardSection.querySelector('div#expenses span#amount');
    totalExpensesAmount.textContent = totalExpenses.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
};

const populateBudgetPlansSection = (monthYear) => {
    const section = document.querySelector('section#budget-plans-section');
    const title = section.querySelector('span.section-title');
    title.textContent = `Budget Plans for ${monthYearToString(monthYear)}`
};

const populateRecentTransactionsList = (allTransactions) => {
    const recentTransactionsList = document.querySelector('section#recent-transactions div.transaction-list');
    const newChildren = allTransactions.map(transaction => createTransactionElement(transaction));
    recentTransactionsList.replaceChildren(...newChildren);
};
