const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const api = require('./src/api/routes');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    app.use(cors());
    next();
})

app.use('/api', api);

app.get('/', (req, res) => {
    res.send("Sigaa-rest-api")
})
app.listen(process.env.PORT || 3000, () => {
    console.log("Servidor iniciado")
})