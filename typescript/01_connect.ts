import { createClient } from "cubrid-client";

const db = createClient({
  host: "localhost",
  port: 33000,
  database: "testdb",
  user: "dba",
  password: "",
});

async function main(): Promise<void> {
  try {
    const rows = await db.query("SELECT 1 + 1 AS result");
    console.log(`1 + 1 = ${rows[0]?.result}`);
  } finally {
    await db.close();
  }
}

main().catch((error: unknown) => {
  console.error("Connection example failed:", error);
  process.exit(1);
});
