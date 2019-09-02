import { Router } from "express";

const router: Router = Router();

router.get("/prova", (req, res) => res.render("index", { title: "Prova", user: req.user }));

router.get("/", (req, res) => res.render("home", { title: "FantaIC", user: req.user }));

router.get("/regolamento", (req, res) => res.render("regulation", { title: "FantaIC - Regolamento", user: req.user }));

router.get("/classifica", (req, res) => res.render("leaderboard", { title: "FantaIC - Classifica", user: req.user, 
    teams: [{ name: "Ciccio", points: 24, position: 1 }, { name: "Andrea", points: 17, position: 2 },
    { name: "Carlo", points: 5, position: 3}, {name: "Piero", points: 4, position: 4} ] }));

router.get("/crea", (req, res) => res.render("createteam", { title: "FantaIC - Crea squadra", user: req.user }));

export { router }