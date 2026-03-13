const minimist = require('minimist');
const readline = require('readline');

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

  // 3. FLEXIBILITY: Use the flag (--name) OR ask if it's missing
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
  } else {
    console.log("[DENIED] Invalid Amount");
  }
}

authorize();