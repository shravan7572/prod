const { spawn } = require("child_process");

console.log("\x1b[36m%s\x1b[0m", "Starting ShipIt dev environment (Web + WebSocket)...");

const ws = spawn("node", ["ws-server/index.ts"], {
  stdio: "inherit",
  env: { ...process.env, WS_PORT: process.env.WS_PORT || "8080" },
});

const web = spawn("npx", ["next", "dev", "--webpack", "-p", process.env.PORT || "3000"], {
  stdio: "inherit",
  env: process.env,
});

function cleanup() {
  console.log("\nShutting down dev servers...");
  try { ws.kill("SIGTERM"); } catch (_) {}
  try { web.kill("SIGTERM"); } catch (_) {}
  process.exit(0);
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

ws.on("exit", (code) => {
  if (code !== 0 && code !== null) {
    console.error(`WebSocket server exited with code ${code}`);
  }
});

web.on("exit", (code) => {
  if (code !== 0 && code !== null) {
    console.error(`Next.js server exited with code ${code}`);
  }
});
