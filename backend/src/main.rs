mod models;
mod routes;
mod state;

use mongodb::{Client, options::ClientOptions};
use state::AppState;
use std::{env, net::SocketAddr};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Load the .env file
    dotenv::dotenv().ok();

    let client_uri = env::var("MONGODB_URI").expect("Mongodb URI must be provided.");
    let options = ClientOptions::parse(client_uri).await?;
    let client = Client::with_options(options)?;
    let notes_collection = client.database("notes-db").collection("notes");

    let state = AppState { notes_collection };
    let app = routes::create_router(state);

    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    println!("Server running on http://{}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();

    Ok(())
}
