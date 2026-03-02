const express = require("express");
const path = require("path");
const fs = require("fs");
const { managerAction } = require("./manager_action");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// GET /api/data — returns ledger and pending transactions
app.get("/api/data", (req, res) => {
  const ledger = JSON.parse(fs.readFileSync(path.join(__dirname, "ledger.json")));
  const pending = JSON.parse(fs.readFileSync(path.join(__dirname, "pending_transactions.json")));
  res.json({ ledger, pending });
});

// POST /api/approve — approve or deny a pending transaction
// Body: { transactionId, managerId, action }
app.post("/api/approve", (req, res) => {
  const { transactionId, managerId, action } = req.body;

  if (!transactionId || !managerId || !action) {
    return res.status(400).json({ error: "transactionId, managerId, and action are required." });
  }

  const result = managerAction(transactionId, managerId, action);
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`Ghost Bank server running at http://localhost:${PORT}`);
});
