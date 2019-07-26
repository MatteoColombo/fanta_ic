import express from "express";
import path from "path";
import helmet from "helmet";
import compression from "compression";

const app = express();
const PORT = process.env.PORT || 4200;
const STATIC_DIR = path.join(__dirname, "static");
const NODE_ENV = process.env.NODE_ENV || "development";

app.use("/static", express.static(STATIC_DIR));
app.use(helmet());
app.use(compression());

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("index", {title:"Fanta IC 2020"});
});

app.use(function (req, res, next) {
    //TODO make a 404 page 
    res.status(404).send("Sorry can't find that!")
})

app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!');
})

// tslint:disable-next-line:no-console
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
