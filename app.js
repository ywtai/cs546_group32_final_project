import express from 'express';
const app = express();
import configRoutes from './routes/index.js';
import exphbs from 'express-handlebars';
import session from 'express-session';
import {fileURLToPath} from "url";
import {dirname} from "path";
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use('/public', express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.engine("handlebars", exphbs.engine({defaultLayout: "main"}));
app.set("view engine", "handlebars");
app.use(limiter);

app.use(
    session({
        name: 'AuthState',
        secret: 'some secret string!',
        resave: false,
        saveUninitialized: false
    })
);

app.use((req, res, next) => {
    // Retrieve user from session
    const user = req.session.user;

    // Check if user exists in the session to determine login status
    const isLoggedIn = (user !== undefined);

    // Make user and login status available in all views
    res.locals.user = user;
    res.locals.isLoggedIn = isLoggedIn;

    next();
});

configRoutes(app);

app.listen(3000, () => {
    console.log("We've now got a server!");
    console.log('Your routes will be running on http://localhost:3000');
});
