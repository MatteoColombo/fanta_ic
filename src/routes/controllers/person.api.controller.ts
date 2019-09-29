import { RepoManager } from "../../database/repo-manager";
import passport from "passport";
import { CuberRepository } from "../../database/repos/cuber.repository";
import { CuberModel } from "../../model/cuber";
import request from "request-promise";
import { config } from "../../secrets/config";
import cheerio from "cheerio";
import { TeamRepository } from "../../database/repos/team.repository";
import { TeamModel } from "../../model/team";
import { EventRepository } from "../../database/repos/event.repository";
import { ResultRepository } from "../../database/repos/result.repository";
import { EventModel } from "../../model/event";
import { ResultModel } from "../../model/result";


export async function getCubers(req, res) {
    let repo: CuberRepository = RepoManager.getCuberRepo();
    let cubers: CuberModel[] = await repo.getCubers(true);
    res.status(200).json(cubers);
}

export async function importCubers(req, res) {
    try {
        const page: string = await getWCACompetitors(config.wca.competition_id);
        const p: Array<{ name: string, country: string, wcaId: string }> = [];
        let $ = cheerio.load(page);
        $("tbody tr td.name:not(:has(a)), tbody tr td.name a").map(async (i, e) => {
            if (e.attribs['href']) p.push({ name: e.firstChild.data, country: null, wcaId: e.attribs['href'].substr(-10, 10) });
            else p.push({ name: e.firstChild.data.trim(), country: null, wcaId: null });
        }).get();
        $("tbody tr td.country").map(async (i, e) => p[i].country = e.firstChild.data.trim()).get();

        const repo: CuberRepository = RepoManager.getCuberRepo();

        for (let c of p) {
            if (c.country !== config.game.country) continue;
            if (c.name.startsWith("\n")) { c.name = c.name.substr(2).trim(); }
            let cuber: CuberModel = new CuberModel();
            cuber.name = c.name;
            cuber.wcaId = c.wcaId;
            if (c.wcaId) {
                let profile = await getProfilePic(c.wcaId);
                if (!profile.person.avatar.is_default) cuber.photoUrl = profile.person.avatar.thumb_url;
            }
            await repo.addCuber(cuber);
        }
        const cubers: CuberModel[] = await repo.getCubers(true);
        res.status(200).json(cubers);

    } catch (e) {
        res.status(500).json({ error: "SERVER_ERROR" });
    }
}

/**
 * Download the HTML page containing the competitors list.
 *
 * @param id The WCA competition ID
 */
async function getWCACompetitors(id: string) {
    return request({
        json: false,
        method: "GET",
        uri: `https://www.worldcubeassociation.org/competitions/${id}/registrations`
    });
}

async function getProfilePic(id: string) {
    return request({
        json: true,
        method: "GET",
        uri: `https://www.worldcubeassociation.org/api/v0/persons/${id}`
    });
}

export async function importPrices(req, res) {
    try {
        const eRepo: EventRepository = RepoManager.getEventRepo();
        const rRepo: ResultRepository = RepoManager.getResultRepo();
        const cRepo: CuberRepository = RepoManager.getCuberRepo();
        const events: EventModel[] = await eRepo.getEvents();

        for (const event of events) {
            const page: string = await getWCACompetitorsForEvent(config.wca.competition_id, event.eventId);
            let p: Array<{ name: string, country: string, rank: number }> = [];
            let $ = cheerio.load(page);
            $("tbody tr td.name").map(async (i, e) => p.push({ name: e.firstChild.data, country: null, rank: 0 })).get();
            $("tbody tr td.country").map(async (i, e) => p[i].country = e.firstChild.data).get();
            if (event.sortByAverage) {
                $("tbody tr td.world-rank-average:not(:empty)").map(async (i, e) => p[i].rank = parseInt(e.firstChild.data)).get();
            } else {
                $("tbody tr td.world-rank-single:not(:empty)").map(async (i, e) => p[i].rank = parseInt(e.firstChild.data)).get();
            }

            p = p.filter((pers) => pers.country === config.game.country);
            let prevRank: number = 0;
            let prevPos: number = 0;

            for (let i = 0; i < Math.min(config.game.at_points, p.length); i++) {
                if (!p[i].rank) { continue; }
                let result: ResultModel = new ResultModel();
                let cuber: CuberModel = await cRepo.getCuberByName(p[i].name);
                result.cuber = cuber.id;
                result.eventId = event.eventId;

                if (prevRank === p[i].rank)
                    result.rank = prevPos;
                else result.rank = i + 1;

                result.points = config.game.points[result.rank] * event.multiplicator;

                prevRank = p[i].rank;
                prevPos = result.rank;
                await rRepo.insertResult(result, event.eventId, cuber.id);
            }

        }

        let cubers: CuberModel[] = await cRepo.getCubers(true);
        for (let cuber of cubers) {
            let results: ResultModel[] = await rRepo.getResultsByPerson(cuber.id);
            results.sort((a, b) => (b.points - a.points));
            results = results.filter((e, i) => i < Math.min(results.length, config.game.best_n_placements_to_consider));
            let price = results.reduce((v, c) => v + c.points, 0);
            await cRepo.updatePrice(cuber.id, price);
        }
        cubers = await cRepo.getCubers(true);

        res.status(200).json(cubers);

    } catch (e) {
        res.status(500).json({ error: "SERVER_ERROR" });
    }
}

async function getWCACompetitorsForEvent(id: string, event: string) {
    return request({
        json: false,
        method: "GET",
        uri: `https://www.worldcubeassociation.org/competitions/${id}/registrations/psych-sheet/${event}`
    });
}

export async function getTeam(req, res) {
    let repo: TeamRepository = RepoManager.getTeamRepo();
    let hasTeam: boolean = await repo.userHasTeam(req.user.id);
    if (hasTeam) {
        let team: TeamModel = await repo.getUserTeam(req.user.id);
        res.status(200).json(team);
    } else {
        res.status(200).json({});
    }
}
