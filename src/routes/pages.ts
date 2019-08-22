import { Router } from "express";

const router: Router = Router();

router.get("/", (req, res) => res.render("index", { title: "Prova", user: req.user }));

router.get("/home", (req, res) => res.render("home", { title: "FantaIC", user: req.user }));

export { router }