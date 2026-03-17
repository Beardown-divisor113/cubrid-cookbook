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
    await db.query("DROP TABLE IF EXISTS cookbook_error_users");
    await db.query(`
      CREATE TABLE cookbook_error_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(200) UNIQUE NOT NULL
      )
    `);

    await db.query(
      "INSERT INTO cookbook_error_users (email) VALUES (?)",
      ["alice@example.com"],
    );

    try {
      await db.query(
        "INSERT INTO cookbook_error_users (email) VALUES (?)",
        ["alice@example.com"],
      );
    } catch (error: unknown) {
      const name = error instanceof Error ? error.name : "UnknownError";
      if (name === "QueryError") {
        console.log("QueryError handled for duplicate key.");
        console.log(String(error));
        return;
      }

      throw error;
    }
  } finally {
    await db.query("DROP TABLE IF EXISTS cookbook_error_users").catch(() => undefined);
    await db.close().catch(() => undefined);
  }
}

main().catch((error: unknown) => {
  console.error("constraint violation example failed:", error);
  process.exit(1);
});
