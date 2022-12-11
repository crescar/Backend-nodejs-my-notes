const {Router} = require('express')
const routes = Router();

routes.use('/auth', require('./AuthRoutes'));
routes.use('/notebooks',require('./NotebooksRoutes'));
routes.use('/notes',require('./NotesRoutes'));

module.exports = routes;