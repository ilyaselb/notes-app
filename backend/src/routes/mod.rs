pub mod notes;

use crate::state::AppState;
use axum::{
    Router,
    routing::{delete, get},
};
use notes::{create_note, delete_note, get_notes, update_note};
use tower_http::cors::{Any, CorsLayer};

pub fn create_router(state: AppState) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    Router::new()
        .route("/notes", get(get_notes).post(create_note))
        .route("/notes/{id}", delete(delete_note).put(update_note))
        .layer(cors)
        .with_state(state)
}
