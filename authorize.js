const fs = require("fs");
const path = require("path");

const employees = JSON.parse(fs.readFileSync(path.join(__dirname, "employees.json")));
const mccPolicy = JSON.parse(fs.readFileSync(path.join(__dirname, "mcc_policy.json")));

const PENDING_FILE = path.join(__dirname, "pending_transactions.json");

function loadPending() {
  if (!fs.existsSync(PENDING_FILE)) return [];
  return JSON.parse(fs.readFileSync(PENDING_FILE));
}

function savePending(transactions) {
  fs.writeFileSync(PENDING_FILE, JSON.stringify(transactions, null, 2));
}

function authorize({ employeeId, merchant, mcc, amount }) {
  const timestamp = new Date().toISOString();
  console.log("\n============================");
  console.log(`[${timestamp}] SWIPE INITIATED`);
  console.log(`  Employee : ${employeeId}`);
  console.log(`  Merchant : ${merchant}`);
  console.log(`  MCC      : ${mcc}`);
  console.log(`  Amount   : $${amount}`);
  console.log("============================");

  const employee = employees[employeeId];
  if (!employee) {
    console.log(`[DENIED] Unknown employee: ${employeeId}`);
    return { status: "DENIED", reason: "Unknown employee" };
  }

  if (mccPolicy.blocked.includes(mcc)) {
    console.log(`[DENIED] MCC category '${mcc}' is blocked by policy.`);
    return { status: "DENIED", reason: `Blocked MCC: ${mcc}` };
  }

  const isAllowed = mccPolicy.allowed.includes(mcc);

  if (!isAllowed) {
    console.log(`[DENIED] MCC category '${mcc}' is not in the allowed list.`);
    return { status: "DENIED", reason: `MCC not allowed: ${mcc}` };
  }

  if (amount <= employee.limit) {
    console.log(`[APPROVED] $${amount} is within ${employeeId}'s limit of $${employee.limit}.`);
    return { status: "APPROVED" };
  }

  // Allowed MCC but over limit — escalate
  const pending = loadPending();
  const txId = `TXN-${Date.now()}`;
  const transaction = {
    id: txId,
    employeeId,
    merchant,
    mcc,
    amount,
    status: "PENDING_MANAGER_APPROVAL",
    managerRequired: employee.manager,
    initiatedAt: timestamp
  };
  pending.push(transaction);
  savePending(pending);

  console.log(`[PENDING_MANAGER_APPROVAL] $${amount} exceeds ${employeeId}'s limit of $${employee.limit}.`);
  console.log(`  Transaction ID : ${txId}`);
  console.log(`  Escalated to   : ${employee.manager}`);
  console.log(`  Saved to       : pending_transactions.json`);

  return { status: "PENDING_MANAGER_APPROVAL", transactionId: txId, escalatedTo: employee.manager };
}

// --- Run test if called directly ---
const args = process.argv.slice(2);
if (args.length === 0) {
  // Default test: Junior_Dev spending $500 at AWS (SaaS)
  authorize({
    employeeId: "Junior_Dev",
    merchant: "AWS",
    mcc: "SaaS",
    amount: 500
  });
} else {
  const [employeeId, merchant, mcc, amount] = args;
  authorize({ employeeId, merchant, mcc, amount: parseFloat(amount) });
}

module.exports = { authorize };
