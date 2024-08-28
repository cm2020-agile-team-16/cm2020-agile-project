import {
    monthYearToString,
    fetchIncomeMonthYears,
    fetchTransactionsForMonthYear,
    fetchAllIncomeCategories,
    fetchBudgetedIncome,
    createTransactionElement,
} from "./commonPageHelpers.js";

let financialHealthChart = null;
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
    // Destroy old chart to make canvas available, then render new chart
    if (financialHealthChart) {
        financialHealthChart.destroy();
        financialHealthChart = null;
    }

    financialHealthChart = renderFinancialHealthChart(
        currentTransactions.incomes,
        incomeCategories,
        budgetedIncome,
        currentMonthYear
    );
};