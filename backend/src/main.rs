use axum::{Json, Router, extract::State, routing::get};
use futures::TryStreamExt;
use mongodb::{Client, Collection, bson::doc, options::ClientOptions};
use serde::{Deserialize, Serialize};
use std::{env, net::SocketAddr};
use tower_http::cors::{Any, CorsLayer};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Note {
    pub title: String,
    pub content: String,
}

#[derive(Clone)]
struct AppState {
    notes_collection: Collection<Note>,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Load the .env file
    dotenv::dotenv().ok();

    let client_uri = env::var("MONGODB_URI").expect("Mongodb URI must be provided.");
    let options = ClientOptions::parse(client_uri).await?;
    let client = Client::with_options(options)?;

    let db = client.database("notes-db");
    let notes_collection = db.collection::<Note>("notes");

    let state = AppState { notes_collection };

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/notes", get(get_notes).post(create_note))
        .layer(cors)
        .with_state(state);

    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    println!("Server running on http://{}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();

    Ok(())
}

async fn get_notes(State(state): State<AppState>) -> Json<Vec<Note>> {
    let mut cursor = state.notes_collection.find(doc! {}).await.unwrap();
    let mut notes = Vec::new();

    while let Some(note) = cursor.try_next().await.unwrap() {
        notes.push(note);
    }

    Json(notes)
}

async fn create_note(State(state): State<AppState>, Json(payload): Json<Note>) -> Json<Note> {
    state
        .notes_collection
        .insert_one(payload.clone())
        .await
        .unwrap();
    Json(payload)
}
