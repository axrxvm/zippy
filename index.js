require('dotenv').config();
const express = require('express');
const apiRouter = require('./api/routes');
const app = express();
const cors = require('cors')
const port = process.env.PORT || 3000;


app.use(cors());

app.use('/', apiRouter);

app.listen(port, ()=>{
    console.log(`[INFO] Welcome to Zippy. The application has started and is listening to requests on Port ${port}`);
});