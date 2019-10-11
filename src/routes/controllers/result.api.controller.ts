import request from "request-promise";
import { RepoManager } from "../../database/repo-manager";
import { CuberRepository } from "../../database/repos/cuber.repository";
import { EventRepository } from "../../database/repos/event.repository";
import { ResultRepository } from "../../database/repos/result.repository";
import { TeamRepository } from "../../database/repos/team.repository";
import { CuberModel } from "../../model/cuber";
import { EventModel } from "../../model/event";
import { ResultModel } from "../../model/result";
import { TeamModel } from "../../model/team";
import { config } from "../../secrets/config";

export async function getImportableEvents(req, res) {
    const repo: EventRepository = RepoManager.getEventRepo();
    const events: EventModel[] = await repo.getImportableRounds();
    res.status(200).json(events);
}

export async function importRound(req, res) {
    try {
        const eRepo: EventRepository = RepoManager.getEventRepo();
        const cRepo: CuberRepository = RepoManager.getCuberRepo();
        const rRepo: ResultRepository = RepoManager.getResultRepo();
        const event: EventModel = await eRepo.getEvent(req.params.event);
        const compId = config.wca.competition_id;
        const json = await getWCALiveJSON(compId, req.params.event, req.params.round);
        const wResults = json.data.round.results;
        let results: ResultModel[] = [];
        for (const wr of wResults) {
            // Exclude foreign people and those who don't have results
            if (wr.person.country.name !== config.game.country) { continue; }
            if (wr.best === 0) { continue; }
            const cuber: CuberModel = await cRepo.getCuberByName(wr.person.name);
            const result: ResultModel = new ResultModel();
            result.best = wr.best;
            result.average = wr.average;
            result.eventId = event.eventId;
            result.cuber = cuber ? cuber.id : null;
            if (wr.recordTags.single) {
                if (wr.recordTags.single === "NR")
                    result.singleRecord = 1;
                if (["WR", "ER", "SAR", "NAR", "AsR", "AfR", "OcR"].find(r => r === wr.recordTags.single))
                    result.singleRecord = 3;
            }
            if (wr.recordTags.average) {
                if (wr.recordTags.average === "NR")
                    result.averageRecord = 1;
                if (["WR", "ER", "SAR", "NAR", "AsR", "AfR", "OcR"].find(r => r === wr.recordTags.average))
                    result.averageRecord = 3;
            }
            results.push(result);
        }
        if (event.sortByAverage) {
            results.sort((a, b) => compareAverages(a, b));
        } else {
            results.sort((a, b) => compareBest(a, b));
        }

        assignPositions(results);
        assignPoints(results, event, event.importedRounds === 0);
        await insertResult(results, rRepo);
        await updateCuberPoints(rRepo, cRepo);

        const tRepo: TeamRepository = RepoManager.getTeamRepo();
        let teams: TeamModel[] = await tRepo.getTeams();
        updateTeamPoints(teams);
        teams.sort((a, b) => b.points - a.points);
        updateTeamsRank(teams);
        await saveTeamsRank(teams, tRepo);
        await eRepo.setEventRemainingRounds(event.eventId, event.importedRounds + 1);
        teams = await tRepo.getTeams();
        res.status(200).json(teams);
    } catch (e) {
        res.status(400).json({ error: "BAD_REQUEST" });
    }
}

function compareBest(a, b) {
    if (a.best === b.best) { return 0; }
    if (a.best <= 0 && b.best <= 0) { return 0; }
    if (a.best <= 0) { return 1; }
    if (b.best <= 0) { return -1; }
    return a.best - b.best;
}

function compareAverages(a, b) {
    if (a.average === b.average) { return compareBest(a, b); }
    if (a.average === 0) { return 1; }
    if (b.average === 0) { return -1; }
    if (a.average < 0) { return 1; }
    if (b.average < 0) { return -1; }
    return a.average - b.average;
}

function assignPositions(arr: ResultModel[]) {
    let prevRank: number = 0;
    let prevAvg: number = 0;
    let prevSing: number = 0;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].average === prevAvg && arr[i].best === prevSing) {
            arr[i].rank = prevRank;
        } else {
            arr[i].rank = i + 1;
            prevRank = i + 1;
            prevAvg = arr[i].average;
            prevSing = arr[i].best;
        }
    }
}

export function assignPoints(arr: ResultModel[], event: EventModel, first: boolean) {
    for (const res of arr) {
        if (res.rank > config.game.at_points) {
            res.points = 0;
        } else {
            if (res.best <= 0 && first) {
                res.points = 0;
            } else {
                res.points = config.game.points[res.rank] * event.multiplicator;
            }
        }
    }
}

async function insertResult(arr: ResultModel[], repo: ResultRepository) {
    for (const r of arr) {
        if (!r.cuber) { continue; }
        await repo.insertResult(r, r.eventId, r.cuber);
    }
}

async function updateCuberPoints(rRepo: ResultRepository, cRepo: CuberRepository) {
    const cubers: CuberModel[] = await cRepo.getCubers(true);
    for (const cuber of cubers) {
        const results: ResultModel[] = await rRepo.getResultsByPerson(cuber.id);
        results.sort((a, b) => b.points - a.points);
        cuber.points = 0;
        for (let i = 0; i < Math.min(results.length, config.game.best_n_placements_to_consider); i++) {
            cuber.points += results[i].points;
        }
        let records: number = results.reduce((v, r) => v + (r.singleRecord + r.averageRecord), 0) * 50;
        console.log(records);
        cuber.points += Math.min(150, records);
        const r3: ResultModel = results.find((r) => r.eventId === "333");
        cuber.rank3 = r3 ? r3.rank : 99999;
        await cRepo.updatePoints(cuber.id, cuber.points, cuber.rank3);
    }
}

function updateTeamPoints(teams: TeamModel[]) {
    for (const team of teams) {
        team.points = team.cubers.reduce((v, c) => v + c.points, 0);
    }
}

export function updateTeamsRank(teams: TeamModel[]) {
    let prevPoints = 0;
    let prevRank = 0;
    const dupRank: Set<number> = new Set<number>();
    // Assign all the ranks with duplicates
    for (let i = 0; i < teams.length; i++) {
        if (teams[i].points === prevPoints) {
            teams[i].rank = prevRank;
            dupRank.add(prevRank);
        } else {
            teams[i].rank = i + 1;
            prevRank = i + 1;
            prevPoints = teams[i].points;
        }
    }
    for (const rank of dupRank) {
        const tiedTeams: TeamModel[] = teams.filter((t) => t.rank === rank);
        const stillTied: Set<number> = new Set<number>();
        for (const team of tiedTeams) {
            team.cubers.sort((a, b) => b.points - a.points);
        }
        tiedTeams.sort((a, b) => {
            const ca = a.cubers;
            const cb = b.cubers;
            for (let i = 0; i < ca.length; i++) {
                if (ca[i].points > cb[i].points) { return -1; }
                if (cb[i].points > ca[i].points) { return 1; }
            }
            const rank3B: number = ca.reduce((v, c) => c.rank3 < v ? c.rank3 : v, 999);
            const rank3A: number = cb.reduce((v, c) => c.rank3 < v ? c.rank3 : v, 999);
            if (rank3A > rank3B) { return -1; }
            if (rank3B > rank3A) { return 1; }
            stillTied.add(a.id);
            stillTied.add(b.id);
            return 0;
        });
        for (let i = 0; i < tiedTeams.length; i++) {
            if (stillTied.has(tiedTeams[i].id)) {
                tiedTeams[i].rank = rank + (tiedTeams.length - stillTied.size);
            } else {
                tiedTeams[i].rank = rank + i;
            }
        }
    }
}

async function saveTeamsRank(arr: TeamModel[], tRepo: TeamRepository) {
    for (const team of arr) {
        tRepo.updateTeamRank(team.id, team.rank, team.points);
    }
}

async function getWCALiveJSON(compId, eventId, roundNumber) {
    return request({
        body: {
            operationName: "Round",
            query: "query Round($competitionId: ID!, $roundId: ID!) {\nround(competitionId: $competitionId, roundId: $roundId) {\n id\n name\n results {\n ranking\n best\n average\n person {\n wcaId\n name\n country {\n name\n}\n} recordTags {\n single\n average\n}\n}\n}\n}\n",
            variables: { competitionId: compId, roundId: `${eventId}-r${roundNumber}` }
        },
        json: true,
        method: "POST",
        uri: "https://live.worldcubeassociation.org/api"
    });
}
