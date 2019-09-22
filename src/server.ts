import bodyparser from "body-parser";
import compression from "compression";
import express from "express";
import session from "express-session";
import helmet from "helmet";
import passport from "passport";
import path from "path";
import "reflect-metadata";
import { TypeormStore } from "typeorm-store";
import { Database } from "./database/database";
import { Session } from "./database/entities/session.entity";
import { router as apis } from "./routes/apis";
import { router as pages } from "./routes/pages";
import { config } from "./secrets/config";

const app = express();
const PORT = process.env.PORT || 4200;
const PRODUCTION = process.env.NODE_ENV === "production";
const STATIC_DIR = path.join(__dirname, "public");
const db: Database = new Database();

db.createConnection()
    .then(() => db.initDatabase())
    .then(() => {
        setMiddleware();
        addSession();
        setViewEngine();
        setRoutes();
        setStaticFiles();
        setErrorHandlers();
        setPort();
        app.listen(app.get("port"), () => {
            return;
        });
    });

function setMiddleware() {
    app.use(helmet());
    app.use(bodyparser.json());
    app.use(compression());
    app.use(bodyparser.urlencoded({ extended: true }));
}

function addSession() {
    const repo = db.connection.getRepository(Session);
    const sess = {
        cookie: config.session.cookie,
        resave: true,
        saveUninitialized: false,
        secret: config.session.secret,
        store: new TypeormStore({ repository: repo })
    };

    if (PRODUCTION) {
        app.set("trust proxy", 1); // trust first proxy
        sess.cookie.secure = false; // serve secure cookies
    }
    app.use(session(sess));

    app.use(passport.initialize());
    app.use(passport.session());
}

function setViewEngine() {
    app.set("views", path.join(__dirname, "views"));
    app.set("view engine", "ejs");
}

function setStaticFiles() {
    app.use("/public", express.static(STATIC_DIR));
}

function setRoutes() {
    app.use("/api", apis);
    app.use(pages);
}

function setErrorHandlers() {
    app.use((req, res, next) => {
        // TODO replace this with an error page.
        res.status(404).render("error404", { title: "Errore - Pagina non trovata", user: req.user });
    });
}

function setPort() {
    app.set("port", PORT);
}
