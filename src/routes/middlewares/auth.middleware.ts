import express from "express";
import * as passport from "passport";

export function isOrganizer(req: express.Request, res: express.Response, next) {
    if (req.isAuthenticated() && req.user.isOrganizer) {
        next();
    } else {
        res.status(403).json({ error: "SHOULD_BE_ORGANIZER" });
    }
}

export function isLoggedIn(req: express.Request, res: express.Response, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(403).json({ error: "LOGIN_IS_REQUIRED" });
    }
}

export function isGuest(req: express.Request, res: express.Response, next) {
    if (!req.isAuthenticated()) {
        next();
    } else {
        res.status(403).json({ error: "SHOULD_BE_GUEST" });
    }
}
