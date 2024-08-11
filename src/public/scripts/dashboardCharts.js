// Access data attributes in JavaScript
document.addEventListener('DOMContentLoaded', function () {
    const dataElement = document.getElementById('data');
    const budgetedIncome = parseFloat(dataElement.getAttribute('data-budgeted-income'));
    const totalIncome = parseFloat(dataElement.getAttribute('data-total-income'));
    const budgetedExpenses = parseFloat(dataElement.getAttribute('data-budgeted-expenses'));
    const totalExpenses = parseFloat(dataElement.getAttribute('data-total-expenses'));

    const incomeCtx = document.getElementById('incomeChart').getContext('2d');
    const expensesCtx = document.getElementById('expensesChart').getContext('2d');

    // Income Chart
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

    // Expenses Chart
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
                    backgroundColor: 'rgba(252, 51, 51, 1)',
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