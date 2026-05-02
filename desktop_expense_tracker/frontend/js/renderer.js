let expenses = [];

const expenseForm = document.getElementById("expenseForm");
const expenseId = document.getElementById("expenseId");
const title = document.getElementById("title");
const amount = document.getElementById("amount");
const category = document.getElementById("category");
const expenseDate = document.getElementById("expenseDate");
const note = document.getElementById("note");
const expenseTable = document.getElementById("expenseTable");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const monthFilter = document.getElementById("monthFilter");
const monthlyTotal = document.getElementById("monthlyTotal");
const chart = document.getElementById("chart");
const formTitle = document.getElementById("formTitle");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");

function today() {
  return new Date().toISOString().slice(0, 10);
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function formatMoney(value) {
  return "Rs " + Number(value || 0).toLocaleString();
}

function resetForm() {
  expenseForm.reset();
  expenseId.value = "";
  expenseDate.value = today();
  formTitle.textContent = "Add Expense";
  saveBtn.textContent = "Save Expense";
  cancelBtn.classList.add("hidden");
}

async function loadExpenses() {
  expenses = await window.expenseAPI.getAll();
  renderExpenses();
  renderSummary();
}

function getFilteredExpenses() {
  const search = searchInput.value.toLowerCase();
  const selectedCategory = categoryFilter.value;

  return expenses.filter(expense => {
    const matchesSearch =
      expense.title.toLowerCase().includes(search) ||
      (expense.note || "").toLowerCase().includes(search);

    const matchesCategory =
      selectedCategory === "All" || expense.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });
}

function renderExpenses() {
  const filtered = getFilteredExpenses();

  if (filtered.length === 0) {
    expenseTable.innerHTML = `<tr><td colspan="6" class="empty">No expenses found</td></tr>`;
    return;
  }

  expenseTable.innerHTML = filtered.map(expense => `
    <tr>
      <td>${expense.expense_date}</td>
      <td>${expense.title}</td>
      <td><span class="tag">${expense.category}</span></td>
      <td><strong>${formatMoney(expense.amount)}</strong></td>
      <td>${expense.note || "-"}</td>
      <td>
        <div class="row-actions">
          <button onclick="editExpense(${expense.id})">Edit</button>
          <button class="danger" onclick="deleteExpense(${expense.id})">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");
}

async function renderSummary() {
  const selectedMonth = monthFilter.value;
  const summary = await window.expenseAPI.summary(selectedMonth);

  monthlyTotal.textContent = formatMoney(summary.total);

  if (!summary.byCategory.length) {
    chart.innerHTML = `<div class="empty">No data for this month</div>`;
    return;
  }

  const max = Math.max(...summary.byCategory.map(item => item.total));

  chart.innerHTML = summary.byCategory.map(item => {
    const width = max > 0 ? (item.total / max) * 100 : 0;

    return `
      <div class="chart-row">
        <div class="chart-label">
          <span>${item.category}</span>
          <strong>${formatMoney(item.total)}</strong>
        </div>
        <div class="bar-bg">
          <div class="bar-fill" style="width:${width}%"></div>
        </div>
      </div>
    `;
  }).join("");
}

expenseForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    id: expenseId.value ? Number(expenseId.value) : null,
    title: title.value.trim(),
    amount: Number(amount.value),
    category: category.value,
    expense_date: expenseDate.value,
    note: note.value.trim()
  };

  if (data.id) {
    await window.expenseAPI.update(data);
  } else {
    await window.expenseAPI.add(data);
  }

  resetForm();
  await loadExpenses();
});

window.editExpense = function(id) {
  const expense = expenses.find(item => item.id === id);
  if (!expense) return;

  expenseId.value = expense.id;
  title.value = expense.title;
  amount.value = expense.amount;
  category.value = expense.category;
  expenseDate.value = expense.expense_date;
  note.value = expense.note || "";

  formTitle.textContent = "Edit Expense";
  saveBtn.textContent = "Update Expense";
  cancelBtn.classList.remove("hidden");
};

window.deleteExpense = async function(id) {
  const confirmDelete = confirm("Are you sure you want to delete this expense?");
  if (!confirmDelete) return;

  await window.expenseAPI.delete(id);
  await loadExpenses();
};

cancelBtn.addEventListener("click", resetForm);
searchInput.addEventListener("input", renderExpenses);
categoryFilter.addEventListener("change", renderExpenses);
monthFilter.addEventListener("change", renderSummary);

expenseDate.value = today();
monthFilter.value = currentMonth();
loadExpenses();
