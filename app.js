import express from 'express';
const app = express();
import configRoutes from './routes/index.js';
import exphbs from 'express-handlebars';
import session from 'express-session';
import {fileURLToPath} from "url";
import {dirname} from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use('/public', express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.engine("handlebars", exphbs.engine({defaultLayout: "main"}));
app.set("view engine", "handlebars");

app.use(
    session({
        name: 'AuthState',
        secret: 'some secret string!',
        resave: false,
        saveUninitialized: false
    })
);

configRoutes(app);

app.listen(3000, () => {
    console.log("We've now got a server!");
    console.log('Your routes will be running on http://localhost:3000');
});
