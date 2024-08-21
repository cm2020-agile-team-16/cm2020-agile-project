// Access data attributes in JavaScript
document.addEventListener('DOMContentLoaded', function () {
    const categoryChartSection = document.querySelector('section#expense-categories-chart-section');
    const expensesChartSection = document.querySelector('section#expense-chart-section');
    const expenseCategorydataElement = categoryChartSection.querySelector('div.data');
    const budgetedExpenses = parseFloat(expenseCategorydataElement.getAttribute('data-budgeted-expenses'));
    const totalExpenses = parseFloat(expenseCategorydataElement.getAttribute('data-total-expenses'));
    const expenseCategorydataElementDivs = expenseCategorydataElement.querySelectorAll('div');

    const expensesJson = expenseCategorydataElementDivs[0];
    const categoriesJson = expenseCategorydataElementDivs[1];

    const userExpenses = JSON.parse(expensesJson.textContent);
    const allExpenseCategories = JSON.parse(categoriesJson.textContent);

    const expenseCategoriesCtx = categoryChartSection.querySelector('canvas#expense-categories-chart').getContext('2d');
    const expensesCtx = expensesChartSection.querySelector('canvas#expense-chart').getContext('2d');

    const userExpenseCategories = userExpenses.reduce((accumulator, expenses) => {
        if (accumulator[expenses.category]) {
            // Category already exists in accumulator
            accumulator[expenses.category] += expenses.amount;
        } else {
            accumulator[expenses.category] = expenses.amount;
        }
        return accumulator;
    }, Object.fromEntries(allExpenseCategories.map(c => [c.name, 0])));

    const userExpenseCategoriesMap = new Map(Object.entries(userExpenseCategories));

    const sorteduserExpenseCategories = [...userExpenseCategoriesMap]
        .toSorted((a, b) => b[1] - a[1])
        .map(([name, total]) => ({
            name,
            total
        }));
    
    const totalExpensesBeforeExpenses = sorteduserExpenseCategories.reduce((sum, category) => {
        return sum + category.total;
    }, 0);

   const sortedExpenseCategoriesPercentages = sorteduserExpenseCategories.map(({name, total}) => ({
    name: name,
    total: (total / totalExpensesBeforeExpenses) * 100,
   }));

    const expenseCategoriesChart = new Chart(expenseCategoriesCtx, {
        type: 'bar',
        data: {
            labels: sortedExpenseCategoriesPercentages.map(category => category.name),
            datasets: [
                {
                    data: sortedExpenseCategoriesPercentages.map(category => category.total),
                    backgroundColor: 'rgba(63, 236, 63, 1)'
                }
            ]
        },
        options: {
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

    const expensesChart = new Chart(expensesCtx, {
        type: 'bar',
        data: {
            labels: ['Expenses'],
            datasets: [
                {
                    label: 'Budgeted',
                    data: [budgetedExpenses],  // Use JavaScript variable
                    backgroundColor: 'rgba(245, 245, 245, 1)',
                    stack: 'stack1'
                },
                {
                    label: 'Actual',
                    data: [totalExpenses],  // Use JavaScript variable
                    backgroundColor: 'rgba(63, 236, 63, 1)',
                    stack: 'stack2'
                }
            ]
        },
        options: {
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
});