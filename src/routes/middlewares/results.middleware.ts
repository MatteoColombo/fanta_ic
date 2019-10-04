import * as express from "express";
import { RepoManager } from "../../database/repo-manager";
import { EventRepository } from "../../database/repos/event.repository";
import { EventModel } from "../../model/event";

export async function checkInputRequest(req, res, next) {
    const repo: EventRepository = RepoManager.getEventRepo();
    const event: EventModel = await repo.getEvent(req.params.event);
    if (event.eventId) {
        const round: number = Number(req.params.round) || 0;
        if (round === (event.importedRounds + 1) && round <= event.rounds) {
            next();
        } else {
            res.status(400).json({ error: "INVALID_ROUND" });
        }
    } else {
        res.status(404).json({ error: "NOT_FOUND" });
    }
}
