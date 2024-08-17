// Access data attributes in JavaScript
document.addEventListener('DOMContentLoaded', function () {
    const categoryChartSection = document.querySelector('section#income-categories-chart-section');
    const incomeChartSection = document.querySelector('section#income-chart-section');
    const incomeCategorydataElement = categoryChartSection.querySelector('div.data');
    const budgetedIncome = parseFloat(incomeCategorydataElement.getAttribute('data-budgeted-income'));
    const totalIncome = parseFloat(incomeCategorydataElement.getAttribute('data-total-income'));
    const incomeCategorydataElementDivs = incomeCategorydataElement.querySelectorAll('div');

    const incomesJson = incomeCategorydataElementDivs[0];
    const categoriesJson = incomeCategorydataElementDivs[1];

    const userIncomes = JSON.parse(incomesJson.textContent);
    const allIncomeCategories = JSON.parse(categoriesJson.textContent);

    const incomeCategoriesCtx = categoryChartSection.querySelector('canvas#income-categories-chart').getContext('2d');
    const incomeCtx = incomeChartSection.querySelector('canvas#income-chart').getContext('2d');

    const userIncomeCategories = userIncomes.reduce((accumulator, income) => {
        if (accumulator[income.category]) {
            // Category already exists in accumulator
            accumulator[income.category] += income.amount;
        } else {
            accumulator[income.category] = income.amount;
        }
        return accumulator;
    }, Object.fromEntries(allIncomeCategories.map(c => [c.name, 0])));

    const userIncomeCategoriesMap = new Map(Object.entries(userIncomeCategories));

    const sortedUserIncomeCategories = [...userIncomeCategoriesMap]
        .toSorted((a, b) => b[1] - a[1])
        .map(([name, total]) => ({
            name,
            total
        }));
    
    const totalIncomeBeforeExpenses = sortedUserIncomeCategories.reduce((sum, category) => {
        return sum + category.total;
    }, 0);

   const sortedIncomeCategoriesPercentages = sortedUserIncomeCategories.map(({name, total}) => ({
    name: name,
    total: (total / totalIncomeBeforeExpenses) * 100,
   }));

    const incomeCategoriesChart = new Chart(incomeCategoriesCtx, {
        type: 'bar',
        data: {
            labels: sortedIncomeCategoriesPercentages.map(category => category.name),
            datasets: [
                {
                    data: sortedIncomeCategoriesPercentages.map(category => category.total),
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

    const incomeChart = new Chart(incomeCtx, {
        type: 'bar',
        data: {
            labels: ['Income'],
            datasets: [
                {
                    label: 'Budgeted',
                    data: [budgetedIncome],  // Use JavaScript variable
                    backgroundColor: 'rgba(245, 245, 245, 1)',
                    stack: 'stack1'
                },
                {
                    label: 'Actual',
                    data: [totalIncome],  // Use JavaScript variable
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