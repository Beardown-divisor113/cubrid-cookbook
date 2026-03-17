import { createClient } from "cubrid-client";

async function main(): Promise<void> {
  const db = createClient({
    host: "127.0.0.1",
    port: 44444,
    database: "testdb",
    user: "dba",
    password: "",
  });

  try {
    await db.query("SELECT 1");
    throw new Error("Expected connection failure, but query succeeded.");
  } catch (error: unknown) {
    const name = error instanceof Error ? error.name : "UnknownError";
    if (name === "ConnectionError") {
      console.log("ConnectionError handled.");
      console.log(String(error));
      return;
    }

    throw error;
  } finally {
    await db.close().catch(() => undefined);
  }
}

main().catch((error: unknown) => {
  console.error("connection failure example failed:", error);
  process.exit(1);
});
