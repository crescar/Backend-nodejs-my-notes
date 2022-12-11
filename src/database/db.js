const Sequelize = require('sequelize')
const database = require('./config')

const conexion = new Sequelize(
    database.database,
    database.userName,
    database.password,
    {
        host:database.host,
        dialect: database.type
    }
);

module.exports = conexion