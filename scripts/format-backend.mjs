import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const taskByMode = {
  apply: "spotlessApply",
  check: "spotlessCheck",
};

const mode = process.argv[2];
const task = taskByMode[mode];

if (!task) {
  console.error("사용법: node scripts/format-backend.mjs <apply|check>");
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
