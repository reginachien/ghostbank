# Ghost Bank: A Rules-Based Payment Kernel (Regina's first Claude Code project)

Ghost Bank is a Node.js-based prototype for simulating role-based payment flows for internal expense management with policy-driven authorization. 

## 🎯 Project Goals
- **Policy-Driven Authorization**: Transactions are validated against dynamic MCC (Merchant Category Code) policies.
- **Limit Management**: Real-time checking of employee-specific spend limits.
- **Escalation Logic**: High-value or policy-violating transactions are moved to a `PENDING` state for manual manager override.
- **Audit Ledger**: A finalized, immutable-style JSON ledger for post-transaction reconciliation.

## 🏗️ Technical Architecture
The system is built on a "Kernel" model where the authorization script acts as the gatekeeper between the user and the ledger.

- **`authorize.js`**: The core validation engine.
- **`mcc_policy.json`**: The source of truth for allowed/blocked categories.
- **`employees.json`**: User database containing balances and limits.
- **`ledger.json`**: The finalized record of all cleared funds.

---

## 🔄 Version Control: The Evolution
This project has evolved from a simple terminal script into a **Full-Stack Application**.

### Phase 1 (Original)
The prototype used rigid positional arguments:
`node authorize.js [Employee_Name] [Merchant] [Category] [Amount]`

### Phase 2 (Current)
We expanded the "Kernel" to include a web-based management layer:
* **Interactive Prompts**: `authorize.js` now uses `readline` to ask for missing information if flags aren't provided.
* **Real-Time Sync**: Every swipe is automatically sent to a `pending_transactions.json` queue for oversight.
* **Manager Dashboard**: A live web interface powered by Express.js (`server.js`) allows for manual approval/denial of transactions.



---

## 🛠️ Usage

### 1. Start the Bank Server
In your terminal, run the server to host the dashboard:
```bash
node server.js
