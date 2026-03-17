use cubrid_tokio::Client;

const DSN: &str = "cubrid://dba:@localhost:33000/testdb";

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut lock_holder = Client::connect(DSN).await?;
    let mut blocked = Client::connect(DSN).await?;

    lock_holder
        .execute("DROP TABLE IF EXISTS cookbook_timeout_demo", &[])
        .await?;
    lock_holder
        .execute(
            "CREATE TABLE cookbook_timeout_demo (id INT PRIMARY KEY, note VARCHAR(100))",
            &[],
        )
        .await?;
    lock_holder
        .execute("INSERT INTO cookbook_timeout_demo (id, note) VALUES (1, 'initial')", &[])
        .await?;

    lock_holder.execute("BEGIN WORK", &[]).await?;
    lock_holder
        .execute("UPDATE cookbook_timeout_demo SET note = 'locked' WHERE id = 1", &[])
        .await?;

    blocked
        .execute("SET SYSTEM PARAMETERS 'lock_timeout=1'", &[])
        .await?;

    let timed_out = blocked
        .execute("UPDATE cookbook_timeout_demo SET note = 'blocked' WHERE id = 1", &[])
        .await;

    match timed_out {
        Ok(_) => return Err("expected lock timeout error".into()),
        Err(error) => {
            println!("Timeout/lock wait handled: {error}");
        }
    }

    lock_holder.rollback().await?;
    lock_holder
        .execute("DROP TABLE IF EXISTS cookbook_timeout_demo", &[])
        .await?;

    Ok(())
}
