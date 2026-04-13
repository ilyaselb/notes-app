use crate::models::Note;
use mongodb::Collection;

#[derive(Clone)]
pub struct AppState {
    pub notes_collection: Collection<Note>,
}
