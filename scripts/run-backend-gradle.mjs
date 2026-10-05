import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const supportedTasks = new Set(["spotlessApply", "spotlessCheck", "check"]);
const task = process.argv[2];

if (!supportedTasks.has(task)) {
  console.error(
    "사용법: node scripts/run-backend-gradle.mjs <spotlessApply|spotlessCheck|check>",
  );
  process.exit(1);
}

const backendDirectory = fileURLToPath(new URL("../backend/", import.meta.url));
const isWindows = process.platform === "win32";
const command = isWindows ? (process.env.ComSpec ?? "cmd.exe") : "./gradlew";
const args = isWindows ? ["/d", "/s", "/c", `gradlew.bat ${task}`] : [task];

const result = spawnSync(command, args, {
  cwd: backendDirectory,
  stdio: "inherit",
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
