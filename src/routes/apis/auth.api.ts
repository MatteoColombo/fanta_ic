import { Router } from "express";
import passport from 'passport';
import { authMiddleWare } from "../../passport/passport.wca";
const router: Router = Router();



/**
 * Log out the user and then redirect him to the homepage
 */
router.get("/logout", (req, res): void => {
    req.logout();
    res.redirect("/");
});

/**
 * Redirect the user to the WCA website to ask for the permissions 
 */
router.get("/login", authMiddleWare, passport.authenticate('wca'));

/**
 * Log in the user and then redirect him to the root
 */
router.get('/login/callback', passport.authenticate('wca'),
    function (req, res) {
        console.log("Successful login, redirecting user to root")
        res.redirect("/");
    });



export { router } 
