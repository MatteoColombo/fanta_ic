import express from "express";
import path from "path";

const app = express();
const PORT = process.env.PORT || 4200;
const NODE_ENV = process.env.NODE_ENV || "development";
const STATIC_DIR = path.join(__dirname, "../client");

app.use("/static", express.static(STATIC_DIR));

app.get("/", (req, res) => res.send("Ciao"));

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
