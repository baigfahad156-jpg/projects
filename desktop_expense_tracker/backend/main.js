const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const Database = require("better-sqlite3");

let db;

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 900,
    minHeight: 620,
    webPreferences: {
      preload: path.join(__dirname, "frontend/preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile("frontend/index.html");
}

function initDatabase() {
  const dbPath = path.join(app.getPath("userData"), "expenses.db");
  db = new Database(dbPath);

  db.prepare(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      expense_date TEXT NOT NULL,
      note TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
}

app.whenReady().then(() => {
  initDatabase();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("expenses:getAll", () => {
  return db.prepare("SELECT * FROM expenses ORDER BY expense_date DESC, id DESC").all();
});

ipcMain.handle("expenses:add", (event, expense) => {
  const stmt = db.prepare(`
    INSERT INTO expenses (title, amount, category, expense_date, note)
    VALUES (?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    expense.title,
    Number(expense.amount),
    expense.category,
    expense.expense_date,
    expense.note || ""
  );

  return { id: result.lastInsertRowid, ...expense };
});

ipcMain.handle("expenses:update", (event, expense) => {
  db.prepare(`
    UPDATE expenses
    SET title = ?, amount = ?, category = ?, expense_date = ?, note = ?
    WHERE id = ?
  `).run(
    expense.title,
    Number(expense.amount),
    expense.category,
    expense.expense_date,
    expense.note || "",
    expense.id
  );

  return expense;
});

ipcMain.handle("expenses:delete", (event, id) => {
  db.prepare("DELETE FROM expenses WHERE id = ?").run(id);
  return { success: true };
});

ipcMain.handle("expenses:summary", (event, month) => {
  const start = `${month}-01`;
  const endDate = new Date(month + "-01");
  endDate.setMonth(endDate.getMonth() + 1);
  const end = endDate.toISOString().slice(0, 10);

  const total = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) AS total
    FROM expenses
    WHERE expense_date >= ? AND expense_date < ?
  `).get(start, end);

  const byCategory = db.prepare(`
    SELECT category, COALESCE(SUM(amount), 0) AS total
    FROM expenses
    WHERE expense_date >= ? AND expense_date < ?
    GROUP BY category
    ORDER BY total DESC
  `).all(start, end);

  return {
    total: total.total,
    byCategory
  };
});
