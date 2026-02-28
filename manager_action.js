const fs = require("fs");
const path = require("path");

const PENDING_FILE = path.join(__dirname, "pending_transactions.json");
const LEDGER_FILE = path.join(__dirname, "ledger.json");

function loadLedger() {
  return JSON.parse(fs.readFileSync(LEDGER_FILE));
}

function debitLedger(amount, txId, description) {
  const ledger = loadLedger();
  ledger.balance -= amount;
  ledger.transactions.push({
    id: txId,
    type: "DEBIT",
    amount,
    description,
    timestamp: new Date().toISOString(),
    balanceAfter: ledger.balance
  });
  fs.writeFileSync(LEDGER_FILE, JSON.stringify(ledger, null, 2));
  return ledger.balance;
}

function loadPending() {
  if (!fs.existsSync(PENDING_FILE)) return [];
  return JSON.parse(fs.readFileSync(PENDING_FILE));
}

function savePending(transactions) {
  fs.writeFileSync(PENDING_FILE, JSON.stringify(transactions, null, 2));
}

function managerAction(txId, managerId, action) {
  const timestamp = new Date().toISOString();
  const pending = loadPending();
  const idx = pending.findIndex(tx => tx.id === txId);

  if (idx === -1) {
    console.log(`[ERROR] Transaction ${txId} not found in pending queue.`);
    return { status: "ERROR", reason: "Transaction not found" };
  }

  const tx = pending[idx];

  if (tx.status !== "PENDING_MANAGER_APPROVAL") {
    console.log(`[ERROR] Transaction ${txId} is not pending approval (status: ${tx.status}).`);
    return { status: "ERROR", reason: "Transaction not in pending state" };
  }

  if (tx.managerRequired !== managerId) {
    console.log(`[DENIED] ${managerId} is not authorized to approve this transaction. Required: ${tx.managerRequired}`);
    return { status: "DENIED", reason: "Unauthorized manager" };
  }

  const validActions = ["APPROVE", "DENY"];
  if (!validActions.includes(action.toUpperCase())) {
    console.log(`[ERROR] Invalid action '${action}'. Must be APPROVE or DENY.`);
    return { status: "ERROR", reason: "Invalid action" };
  }

  if (action.toUpperCase() === "APPROVE") {
    const ledger = loadLedger();
    if (tx.amount > ledger.balance) {
      tx.status = "DENIED_INSUFFICIENT_FUNDS";
      tx.resolvedBy = managerId;
      tx.resolvedAt = timestamp;
      pending[idx] = tx;
      savePending(pending);
      console.log("\n============================");
      console.log(`[${timestamp}] MANAGER ACTION`);
      console.log(`  Transaction ID : ${txId}`);
      console.log(`  Manager        : ${managerId}`);
      console.log(`  Action         : APPROVE`);
      console.log(`  New Status     : DENIED_INSUFFICIENT_FUNDS`);
      console.log(`  Requested      : $${tx.amount}`);
      console.log(`  Vault Balance  : $${ledger.balance}`);
      console.log("============================");
      return { status: "DENIED_INSUFFICIENT_FUNDS", transactionId: txId };
    }
    const balanceAfter = debitLedger(tx.amount, txId, `${tx.employeeId} → ${tx.merchant} [mgr: ${managerId}]`);
    tx.status = "APPROVED_BY_MANAGER";
    console.log("\n============================");
    console.log(`[${timestamp}] MANAGER ACTION`);
    console.log(`  Transaction ID  : ${txId}`);
    console.log(`  Manager         : ${managerId}`);
    console.log(`  Action          : APPROVE`);
    console.log(`  New Status      : APPROVED_BY_MANAGER`);
    console.log(`  Remaining Vault : $${balanceAfter}`);
    console.log("============================");
  } else {
    tx.status = "DENIED_BY_MANAGER";
    console.log("\n============================");
    console.log(`[${timestamp}] MANAGER ACTION`);
    console.log(`  Transaction ID : ${txId}`);
    console.log(`  Manager        : ${managerId}`);
    console.log(`  Action         : DENY`);
    console.log(`  New Status     : DENIED_BY_MANAGER`);
    console.log("============================");
  }

  tx.resolvedBy = managerId;
  tx.resolvedAt = timestamp;
  pending[idx] = tx;
  savePending(pending);

  return { status: tx.status, transactionId: txId };
}

// --- CLI usage: node manager_action.js <txId> <managerId> <APPROVE|DENY> ---
const [txId, managerId, action] = process.argv.slice(2);
if (!txId || !managerId || !action) {
  console.log("Usage: node manager_action.js <transactionId> <managerId> <APPROVE|DENY>");
  process.exit(1);
}

managerAction(txId, managerId, action);

module.exports = { managerAction };
