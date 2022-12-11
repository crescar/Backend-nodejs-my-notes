const {Router} = require('express')

const notebooks = Router();
const controllers = require('../Controllers/NotebooksControllers')

notebooks.get('/',controllers.getNotebooks);
notebooks.post('/', controllers.createNotebook);
notebooks.get('/:id', controllers.getNotebook );
notebooks.patch('/:id',controllers.updateNotebook);
notebooks.delete('/:id',controllers.deleteNotebook);

module.exports = notebooks;