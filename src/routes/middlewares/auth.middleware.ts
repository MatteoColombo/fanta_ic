import * as passport from "passport";
import express from "express";

export function isLoggedIn(req: express.Request, res: express.Response, next) {
    if (!req.isAuthenticated()) {
        next();
    } else {
        res.status(403);
    }
}

export function isGuest(req: express.Request, res: express.Response, next) {
    if (!req.isAuthenticated()) {
        next();
    } else {
        res.status(403);
    }
}