import { EventRepository } from "../../database/repos/event.repository";
import { RepoManager } from "../../database/repo-manager";
import { EventModel } from "../../model/event";
import { config } from "../../secrets/config";
import request from "request-promise";
import { ResultModel } from "../../model/result";
import { CuberRepository } from "../../database/repos/cuber.repository";
import { CuberModel } from "../../model/cuber";
import { ResultRepository } from "../../database/repos/result.repository";
import { TeamModel } from "../../model/team";
import { TeamRepository } from "../../database/repos/team.repository";

export async function getImportableEvents(req, res) {
    let repo: EventRepository = RepoManager.getEventRepo();
    let events: EventModel[] = await repo.getImportableRounds();
    res.status(200).json(events);
}

export async function importRound(req, res) {
    try {
        const eRepo: EventRepository = RepoManager.getEventRepo();
        const cRepo: CuberRepository = RepoManager.getCuberRepo();
        const rRepo: ResultRepository = RepoManager.getResultRepo();
        console.log(req.params);
        const event: EventModel = await eRepo.getEvent(req.params.event);
        const compId = config.wca.competition_id;
        const json = await getWCALiveJSON(compId, req.params.event, req.params.round);
        const wResults = json.data.round.results;
        let results: ResultModel[] = [];
        for (let wr of wResults) {
            // Exclude foreign people and those who don't have results
            if (wr.person.country.name !== config.game.country) continue;
            if (wr.best === 0) continue;
            let cuber: CuberModel = await cRepo.getCuberByName(wr.person.name);
            let result: ResultModel = new ResultModel();
            result.best = wr.best;
            result.average = wr.average;
            result.eventId = event.eventId;
            result.cuber = cuber.id;
            results.push(result);
        }
        if (event.sortByAverage) {
            results.sort((a, b) => compareAverages(a, b));
        } else {
            results.sort((a, b) => compareBest(a, b));
        }

        assignPositions(results);
        results = results.filter(r => r.rank <= config.game.at_points);
        assignPoints(results, event, event.importedRounds === 0);
        await insertResult(results, rRepo);
        await updateCuberPoints(rRepo, cRepo);

        let tRepo: TeamRepository = RepoManager.getTeamRepo();
        let teams: TeamModel[] = await tRepo.getTeams();
        updateTeamPoints(teams);
        teams.sort((a, b) => b.points - a.points);
        updateTeamsRank(teams);
        await saveTeamsRank(teams, tRepo);
        await eRepo.setEventRemainingRounds(event.eventId, event.importedRounds + 1);
        teams = await tRepo.getTeams();
        res.status(200).json(teams);
    } catch (e) {
        console.log(e);
        res.status(400).json({ error: "BAD_REQUEST" });
    }
}

function compareBest(a, b) {
    if (a.best === b.best) return 0;
    if (a.best <= 0 && b.best <= 0) return 0;
    if (a.best <= 0) return 1;
    if (b.best <= 0) return -1;
    return a.best - b.best;
}

function compareAverages(a, b) {
    if (a.average === b.average) return compareBest(a, b);
    if (a.average === 0) return 1;
    if (b.average === 0) return -1;
    if (a.average < 0) return 1;
    if (b.average < 0) return -1;
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

function assignPoints(arr: ResultModel[], event: EventModel, first: boolean) {
    for (let res of arr) {
        if (res.best <= 0 && first) {
            res.points = 0;
        } else {
            res.points = config.game.points[res.rank] * event.multiplicator;
        }
    }
}

async function insertResult(arr: ResultModel[], repo: ResultRepository) {
    for (let r of arr) {
        if (!r.cuber) continue;
        await repo.insertResult(r, r.eventId, r.cuber);
    }
}

async function updateCuberPoints(rRepo: ResultRepository, cRepo: CuberRepository) {
    let cubers: CuberModel[] = await cRepo.getCubers(true);
    for (let cuber of cubers) {
        let results: ResultModel[] = await rRepo.getResultsByPerson(cuber.id);
        results.sort((a, b) => b.points - a.points);
        cuber.points = 0;
        for (let i = 0; i < Math.min(results.length, config.game.best_n_placements_to_consider); i++) {
            cuber.points += results[i].points;
        }
        let r3: ResultModel = results.find(r => r.eventId === "333");
        cuber.rank3 = r3 ? r3.rank : 99999;
        await cRepo.updatePoints(cuber.id, cuber.points, cuber.rank3);
    }
}

function updateTeamPoints(teams: TeamModel[]) {
    for (let team of teams) {
        team.points = team.cubers.reduce((v, c) => v + c.points, 0);
    }
}

function updateTeamsRank(teams: TeamModel[]) {
    let prevPoints = 0;
    let prevRank = 0;
    let dupRank: Set<number> = new Set<number>();
    //Assign all the ranks with duplicates
    for (let i = 0; i < teams.length; i++) {
        if (teams[i].points === prevPoints) {
            teams[i].rank = prevRank;
            dupRank.add(prevRank);
        } else {
            teams[i].rank = i + i;
            prevRank = i + 1;
            prevPoints = teams[i].points;
        }
    }
    for (let rank of dupRank) {
        let tiedTeams: TeamModel[] = teams.filter(t => t.rank === rank);
        let stillTied: Set<number> = new Set<number>();
        for (let team of tiedTeams) {
            team.cubers.sort((a, b) => b.points - a.points);
        }
        tiedTeams.sort((a, b) => {
            let ca = a.cubers;
            let cb = b.cubers;
            for (let i = 0; i < ca.length; i++) {
                if (ca[i] > cb[i]) return -1;
                if (cb[i] > ca[i]) return 1;
            }
            let rank3B: number = ca.reduce((v, c) => c.rank3 < v ? c.rank3 : v, 999);
            let rank3A: number = cb.reduce((v, c) => c.rank3 < v ? c.rank3 : v, 999);
            if (rank3A > rank3B) return -1;
            if (rank3B > rank3A) return 1;
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
    for (let team of arr) {
        tRepo.updateTeamRank(team.id, team.rank, team.points);
    }
}


async function getWCALiveJSON(compId, eventId, roundNumber) {
    console.log(compId, eventId, roundNumber);
    return request({
        json: true,
        method: "POST",
        uri: "https://live.worldcubeassociation.org/api",
        body: {
            "operationName": "Round",
            "variables": { "competitionId": compId, "roundId": `${eventId}-r${roundNumber}` },
            "query": "query Round($competitionId: ID!, $roundId: ID!) {\nround(competitionId: $competitionId, roundId: $roundId) {\n id\n name\n results {\n ranking\n best\n average\n person {\n wcaId\n name\n country {\n name\n}\n}\n}\n}\n}\n"
        }
    });
}