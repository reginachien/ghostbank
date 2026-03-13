const minimist = require('minimist');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// 1. Parse the command line arguments
const args = minimist(process.argv.slice(2));

// 2. Helper function to create a "Question" prompt
const ask = (query) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
};

async function authorize() {
  console.log("============================");
  console.log("💳 GHOSTBANK SWIPE INITIATED");
  console.log("============================");

  // 3. Collect Data
  let name     = args.name     || args._[0] || await ask("👤 Employee Name: ");
  let merchant = args.merchant || args._[1] || await ask("🏪 Merchant: ");
  let category = args.category || args._[2] || await ask("📂 Category/MCC: ");
  let amount   = args.amount   || args._[3] || await ask("💰 Amount: $");

  // Format the output
  console.log("\n============================");
  console.log(`[${new Date().toISOString()}] TRANSACTION`);
  console.log(`  Employee : ${name}`);
  console.log(`  Merchant : ${merchant}`);
  console.log(`  Category : ${category}`);
  console.log(`  Amount   : $${parseFloat(amount).toFixed(2)}`);
  
  if (!isNaN(amount) && amount > 0) {
    console.log("============================");
    console.log("[APPROVED] Transaction Successful");

    // --- NEW: SAVE TO DASHBOARD LOGIC ---
    
const newTransaction = {
      id: "TXN-" + Date.now(),             // Prefixes like your screenshot
      employeeId: name,                    // Matches 'tx.employeeId' in HTML
      merchant: merchant,
      mcc: category,                       // Matches 'tx.mcc' in HTML
      amount: parseFloat(amount),
      status: "PENDING_MANAGER_APPROVAL",  // CRITICAL: This triggers the buttons!
      managerRequired: "Product_Lead",     // Matches your dashboard logic
      initiatedAt: new Date().toISOString() // Matches 'tx.initiatedAt' in HTML
    };

    try {
      const pendingPath = path.join(__dirname, 'pending_transactions.json');
      
      // Read existing data, or start with empty array if file is empty
      let fileContent = fs.readFileSync(pendingPath, 'utf8');
      const pendingData = fileContent ? JSON.parse(fileContent) : [];

      pendingData.push(newTransaction);

      fs.writeFileSync(pendingPath, JSON.stringify(pendingData, null, 2));
      console.log("✅ Transaction sent to Dashboard for Manager Approval.");
    } catch (err) {
      console.log("⚠️ Error saving to dashboard, but swipe worked.");
    }
    // ------------------------------------

  } else {
    console.log("[DENIED] Invalid Amount");
  }
}

authorize();