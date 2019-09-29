import { Router } from "express";
import passport from "passport";
import { authMiddleWare } from "../../passport/passport.wca";
import { isGuest, isLoggedIn } from "../middlewares/auth.middleware";

const router: Router = Router();

router.get("/logout", isLoggedIn, (req, res) =>
    req.session.destroy(err => res.render("home", { title: "FantaIC", user: null })));

router.get("/login", isGuest, authMiddleWare, passport.authenticate("wca"));

router.get("/login/callback", isGuest, passport.authenticate("wca"),
    (req, res) => res.render("home", { title: "FantaIC", user: req.user }));

export { router };
