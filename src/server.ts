import bodyparser, { urlencoded } from "body-parser";
import compression from "compression";
import express from "express";
import session from "express-session";
import helmet from "helmet";
import * as http from "http";
import passport from "passport";
import path from "path";
import "reflect-metadata";
import { TypeormStore } from "typeorm-store";
import { Database } from "./database/database";
import { Session } from "./database/entities/session.entity";
import { config } from "./secrets/config";
import { router as pages } from "./routes/pages";
import { router as apis } from "./routes/apis";

const app = express();
const PORT = process.env.PORT || 4200;
const PRODUCTION = process.env.NODE_ENV === "production";
const STATIC_DIR = path.join(__dirname, "static");
const db: Database = new Database();
let server: http.Server;

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
        server = http.createServer(app);
        server.listen(PORT);
        server.on("error", onError);
        server.on("listening", onListening);
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
    app.use("/static", express.static(STATIC_DIR));
}

function setRoutes() {
    app.use("/api", apis);
    app.use(pages);
}

function setErrorHandlers() {
    // catch 404 and forward to herror handler
    app.use((req, res, next) => {
        const err = new Error("Not Found");
        next(err);
    });

    // production herror handler
    app.use((err, req, res, next) => {

        res.status(err.status || 500);
        res.json({
            error: {},
            message: err.message,
        });
    });
}

function setPort() {
    app.set("port", PORT);
}

function onError(error) {
    if (error.syscall !== "listen") {
        throw error;
    }

    const bind = typeof PORT === "string"
        ? "Pipe " + PORT
        : "Port " + PORT;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case "EACCES":
            // tslint:disable-next-line
            console.error(bind + " requires elevated privileges");
            process.exit(1);
            break;
        case "EADDRINUSE":
            // tslint:disable-next-line
            console.error(bind + " is already in use");
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening() {
    const addr = server.address();
    const bind = typeof addr === "string"
        ? "pipe " + addr
        : "port " + addr.port;
}
