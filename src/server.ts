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
import { config } from "./secrets/config";
import { router as pages } from "./routes/pages";
import { router as apis } from "./routes/apis";
import errorHandler from "errorhandler";

const app = express();
const PORT = process.env.PORT || 4200;
const PRODUCTION = process.env.NODE_ENV === "production";
const STATIC_DIR = path.join(__dirname, "static");
const db: Database = new Database();

db.createConnection()
    .then(() => db.initDatabase())
    .then(() => console.log("Connection to DB created"))
    .then(() => {
        setMiddleware();
        addSession();
        setViewEngine();
        setRoutes();
        setStaticFiles();
        setErrorHandlers();
        setPort();
        const server = app.listen(app.get("port"), () => {
            console.log(
                "  App is running at http://localhost:%d in %s mode",
                app.get("port"),
                app.get("env")
            );
            console.log("  Press CTRL-C to stop\n");
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
    let sess = {
        secret: config.session.secret,
        resave: true,
        saveUninitialized: false,
        cookie: config.session.cookie,
        store: new TypeormStore({ repository: repo })
    }

    if (PRODUCTION) {
        app.set('trust proxy', 1) // trust first proxy
        sess.cookie.secure = true // serve secure cookies
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
    app.use(function (req, res, next) {
        res.status(404).send('Sorry cant find that!');
    });

    if (!PRODUCTION) {
        app.use(errorHandler());
    }
}

function setPort() {
    app.set("port", PORT);
}

