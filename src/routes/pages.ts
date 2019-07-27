import { Router } from "express";

const router: Router = Router();

router.get("/", (req, res) => res.render("index", { title: "Prova" }));

export { router }