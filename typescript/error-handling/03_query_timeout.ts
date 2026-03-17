import { createClient } from "cubrid-client";

async function main(): Promise<void> {
  const db = createClient({
    host: "localhost",
    port: 33000,
    database: "testdb",
    user: "dba",
    password: "",
  });

  try {
    await db.query("DROP TABLE IF EXISTS cookbook_timeout_demo");
    await db.query("CREATE TABLE cookbook_timeout_demo (id INT PRIMARY KEY, note VARCHAR(100))");
    await db.query("INSERT INTO cookbook_timeout_demo (id, note) VALUES (1, 'initial')");

    const lockHolder = createClient({
      host: "localhost",
      port: 33000,
      database: "testdb",
      user: "dba",
      password: "",
    });

    try {
      await lockHolder.query("SET AUTOCOMMIT = 0");
      await lockHolder.query("UPDATE cookbook_timeout_demo SET note = 'locked' WHERE id = 1");

      await db.query("SET SYSTEM PARAMETERS 'lock_timeout=1'");

      try {
        await db.query("UPDATE cookbook_timeout_demo SET note = 'blocked' WHERE id = 1");
      } catch (error: unknown) {
        const name = error instanceof Error ? error.name : "UnknownError";
        if (name === "QueryError") {
          console.log("Query timeout/lock wait handled.");
          console.log(String(error));
          return;
        }

        throw error;
      }
    } finally {
      await lockHolder.query("ROLLBACK").catch(() => undefined);
      await lockHolder.close().catch(() => undefined);
    }
  } finally {
    await db.query("DROP TABLE IF EXISTS cookbook_timeout_demo").catch(() => undefined);
    await db.close().catch(() => undefined);
  }
}

main().catch((error: unknown) => {
  console.error("query timeout example failed:", error);
  process.exit(1);
});
