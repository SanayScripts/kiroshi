import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname) } },
  // no tests until T9; without this `vitest --run` exits 1
  test: { environment: "node", passWithNoTests: true },
});
