use crate::{models::Note, state::AppState};
use axum::extract::{Json, Path, State};
use futures::TryStreamExt;
use mongodb::bson::{doc, oid::ObjectId};

pub async fn get_notes(State(state): State<AppState>) -> Json<Vec<Note>> {
    let mut cursor = state.notes_collection.find(doc! {}).await.unwrap();
    let mut notes = Vec::new();
    while let Some(note) = cursor.try_next().await.unwrap() {
        notes.push(note);
    }
    Json(notes)
}

pub async fn create_note(State(state): State<AppState>, Json(payload): Json<Note>) -> Json<Note> {
    state
        .notes_collection
        .insert_one(payload.clone())
        .await
        .unwrap();
    Json(payload)
}

pub async fn update_note(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(payload): Json<Note>,
) -> Result<Json<Note>, axum::http::StatusCode> {
    let obj_id = ObjectId::parse_str(&id).map_err(|_| axum::http::StatusCode::BAD_REQUEST)?;
    let update_doc = doc! { "$set": { "title": &payload.title, "content": &payload.content } };
    let result = state
        .notes_collection
        .update_one(doc! { "_id": obj_id }, update_doc)
        .await
        .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?;

    if result.matched_count == 1 {
        Ok(Json(payload))
    } else {
        Err(axum::http::StatusCode::NOT_FOUND)
    }
}

pub async fn delete_note(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<()>, axum::http::StatusCode> {
    let obj_id = ObjectId::parse_str(&id).map_err(|_| axum::http::StatusCode::BAD_REQUEST)?;
    let result = state
        .notes_collection
        .delete_one(doc! { "_id": obj_id })
        .await
        .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?;

    if result.deleted_count == 1 {
        Ok(Json(()))
    } else {
        Err(axum::http::StatusCode::NOT_FOUND)
    }
}
