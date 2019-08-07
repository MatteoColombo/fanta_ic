import express from "express";

function teamHasName(req, res, next) {
    let name: string = req.body.team.name;
    if (name) {
        next();
    } else {
        res.status(400).json({ "error": "MISSING_TEAM_NAME" });
    }
}

export { teamHasName }