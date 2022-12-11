const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const { sequelize } = require('./models/index')

require('dotenv').config();

app.use(cors());
app.use(express.json());
app.use('/api',require('./src/Routes/index'));
app.use(morgan('dev'));

app.listen(process.env.PORT_SERVE,()=>{
    console.log(`server running on port ${process.env.PORT_SERVE}`)
    sequelize.authenticate()
            .then(()=>{
                console.log('conexion DB succefull')
            }).catch((error)=> console.log(`Error Conexion: ${error}`))
});
