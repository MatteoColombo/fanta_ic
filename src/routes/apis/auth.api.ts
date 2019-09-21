import { Router } from "express";
import passport from "passport";
import { authMiddleWare } from "../../passport/passport.wca";
import { isGuest, isLoggedIn } from "../middlewares/auth.middleware";

const router: Router = Router();

/**
 * Log out the user and then redirect him to the homepage
 */
router.get("/logout", isLoggedIn, (req, res): void => {
    req.session.destroy((err) => {
        res.redirect("/");
    });
});

/**
 * Redirect the user to the WCA website to ask for the permissions
 */
router.get("/login", isGuest, authMiddleWare, passport.authenticate("wca"));

/**
 * Log in the user and then redirect him to the root
 */
router.get("/login/callback", isGuest, passport.authenticate("wca"),
    (req, res) => {
        res.redirect("/");
    });

export { router };
