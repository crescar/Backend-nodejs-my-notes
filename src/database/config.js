require('dotenv').config();
const database = {
    userName:process.env.DB_USERNAME,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_NAME,
    host:process.env.DB_HOST,
    type:process.env.DB_TYPE
}

module.exports = database
