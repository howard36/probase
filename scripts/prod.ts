import readline from "readline";
import { spawn } from "child_process";

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("Usage: npm run prod <command>");
  process.exit(1);
}

const command = args.join(" ");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log(`\n⚠️  PRODUCTION: About to run: ${command}\n`);

rl.question("Continue? (y/N): ", (answer) => {
  rl.close();

  if (answer.toLowerCase() !== "y") {
    console.log("Aborted.");
    process.exit(0);
  }

  const child = spawn("dotenv", ["-e", ".env.prod", "--", ...args], {
    stdio: "inherit",
    shell: true,
  });

  child.on("close", (code) => {
    process.exit(code ?? 0);
  });
});
