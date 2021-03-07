import express from 'express';
import cors from 'cors';

const app = express();

import api from './api/routes';
import version from './version';

app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use(cors());

app.use('/api', api);
app.get('/version', version);

app.get('/', (req, res) => {
    res.send("Sigaa-rest-api")
})
app.listen(process.env.PORT || 3000, () => {
    console.log("Servidor iniciado")
})