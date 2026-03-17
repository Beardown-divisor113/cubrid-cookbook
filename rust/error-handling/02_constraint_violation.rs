use cubrid_tokio::Client;

const DSN: &str = "cubrid://dba:@localhost:33000/testdb";

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut client = Client::connect(DSN).await?;

    client
        .execute("DROP TABLE IF EXISTS cookbook_error_users", &[])
        .await?;
    client
        .execute(
            "CREATE TABLE cookbook_error_users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(200) UNIQUE NOT NULL
            )",
            &[],
        )
        .await?;

    client
        .execute(
            "INSERT INTO cookbook_error_users (email) VALUES ('alice@example.com')",
            &[],
        )
        .await?;

    let duplicate = client
        .execute(
            "INSERT INTO cookbook_error_users (email) VALUES ('alice@example.com')",
            &[],
        )
        .await;

    match duplicate {
        Ok(_) => return Err("expected unique constraint violation".into()),
        Err(error) => {
            let message = error.to_string().to_lowercase();
            if message.contains("unique") || message.contains("constraint") {
                println!("Constraint violation handled: {error}");
            } else {
                return Err(error.into());
            }
        }
    }

    client
        .execute("DROP TABLE IF EXISTS cookbook_error_users", &[])
        .await?;

    Ok(())
}
