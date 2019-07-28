import { Router } from "express";
import { isLoggedIn } from "../passport/passport.utils"

const router: Router = Router();

router.get("/", (req, res) => res.render("index", { title: "Prova", user: req.user }));

export { router }