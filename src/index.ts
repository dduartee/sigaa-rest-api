import express from 'express';
import cors from 'cors';
import path from 'path';
const app = express();

import api from './api/routes';
import version from './version';
import headers from './headers';
import body from './body';
app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use(cors());
app.use('/api', api);
app.get('/version', version);
app.all('/headers', headers);
app.all('/body', body);
app.get('/demo', (req, res) => {
    res.sendFile(path.join(__dirname+"/public/index.html"))
});

app.get('/', (req, res) => {
    res.send("Sigaa-rest-api")
})
app.listen(process.env.PORT || 3000, () => {
    console.log("Servidor iniciado")
})