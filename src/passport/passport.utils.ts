import * as passport from "passport";
import express from "express";

export function isLoggedIn(req: express.Request) {
    return req.isAuthenticated();
}