const {Router} = require('express')

const notes = Router();
const controllers = require('../Controllers/NotesControllers')

notes.get('/',controllers.getNotes);
notes.get('/:id',controllers.getNote);
notes.post('/',controllers.createNote);
notes.patch('/:id',controllers.updateNote);
notes.delete('/:id', controllers.deleteNote);
module.exports = notes;