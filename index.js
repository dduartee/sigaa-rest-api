const express = require('express');
const cors = require('cors');

const app = express();

const api = require('./src/api/routes');

app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use(cors());

app.use('/api', api);

app.get('/', (req, res) => {
    res.send("Sigaa-rest-api")
})
app.listen(process.env.PORT || 3000, () => {
    console.log("Servidor iniciado")
})