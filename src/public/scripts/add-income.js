let newIncomeId = 0;

function addNewContainer(categories) {
    const main = document.querySelector('main.container');
    const newForm = document.createElement('form');
    newForm.setAttribute('action', '/user/edit-income');
    newForm.setAttribute('method', 'POST');
    newForm.innerHTML = `
        <input type="hidden" name="id" value="new-${newIncomeId}">
        
        <label for="category-new-${newIncomeId}">Category:</label>
        <select id="category-new-${newIncomeId}" name="category_id" required>
            ${categories.map(category => `
                <option value="${category.category_id}">${category.name}</option>
            `).join('')}
        </select>
        
        <label for="source-new-${newIncomeId}">Source:</label>
        <input type="text" id="source-new-${newIncomeId}" name="source" required>
        
        <label for="amount-new-${newIncomeId}">Amount:</label>
        <input type="number" id="amount-new-${newIncomeId}" name="amount" required>
        
        <button type="submit">Save Changes</button>
    `;
    main.insertBefore(newForm, document.getElementById('addNewButton'));
    newIncomeId++;
}

// Parse the embedded JSON data
const categoriesScript = document.getElementById('categories-data');
const categories = JSON.parse(categoriesScript.textContent);

// Add event listener to the "Add New" button
document.getElementById('addNewButton').addEventListener('click', function() {
    addNewContainer(categories);
});