const {Router} = require('express')

const auth = Router();
const controllers = require('../Controllers/AuthControllers');

auth.post('/register',controllers.registerUser);
auth.post('/login', controllers.login);
auth.delete('/:id', controllers.deleteUser);
auth.get('/:id', controllers.getUser);

module.exports = auth;