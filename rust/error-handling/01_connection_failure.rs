use cubrid_tokio::Client;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let result = Client::connect("cubrid://dba:@127.0.0.1:44444/testdb").await;

    match result {
        Ok(_) => Err("expected connection failure but connected successfully".into()),
        Err(error) => {
            println!("Connection failure handled: {error}");
            Ok(())
        }
    }
}
