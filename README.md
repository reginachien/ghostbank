# ghostbank
Card swipe with MCC and control limits 
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
- **`mcc_policy.json`**: The source of truth for allowed/blocked categories (e.g., Dining, SaaS, Travel).
- **`employees.json`**: User database containing balances and single-transaction limits.
- **`ledger.json`**: The finalized record of all cleared funds.

## 🛠️ Usage (Current Rigid Prototype)
To simulate a transaction, run the following command structure:
```bash
node authorize.js [Employee_Name] [Merchant] [Category] [Amount]
