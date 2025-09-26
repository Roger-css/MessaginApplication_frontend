import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/Db/Schema/V1.ts",
  out: "./drizzle",
  dialect: "sqlite",
  driver: "expo",
});
