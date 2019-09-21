import cheerio from "cheerio";
import { Router } from "express";
import request from "request-promise";
import { getCustomRepository } from "typeorm";
import { CategoryEntity } from "../../database/entities/category.entity";
import { PersonEntity } from "../../database/entities/person.entity";
import { TeamEntity } from "../../database/entities/team.entity";
import { CategoryRepository } from "../../database/repos/category.repository";
import { PersonRepository } from "../../database/repos/person.repository";
import { ResultsRepository } from "../../database/repos/results.repository";
import { TeamRepository } from "../../database/repos/team.repository";
import { PersonModel } from "../../model/person";
import { ResultsModel } from "../../model/results";
import { config } from "../../secrets/config";
import { isLoggedIn, isOrganizer } from "../middlewares/auth.middleware";

const router: Router = Router();

router.get("/", async (req, res) => {
    const persons: PersonEntity[] = await getCustomRepository(PersonRepository).getPersons(true);
    res.status(200).json(persons.map((p) => p._transform()));
});

router.get("/import", isOrganizer, async (req, res) => {
    try {
        // Download the competitors page from the WCA website.
        const page: string = await getWCACompetitors(config.wca.competition_id);
        // Array of objects containing the list of registered people and their country.
        const p: Array<{ name: string, country: string }> = [];
        // Extract all the people names.
        cheerio("tbody tr td.name:not(:has(a)), tbody tr td.name a", page).map(async (i, e) => p.push({ name: e.firstChild.data, country: null })).get();
        // Extract all the people countries.
        cheerio("tbody tr td.country:not(:has(a)), tbody tr td.country a", page).map(async (i, e) => p[i].country = e.firstChild.data).get();
        const repo: PersonRepository = getCustomRepository(PersonRepository);
        // For each person, if their country is not "Italy", discard them. Otherwise add them to the database.
        for (const sp of p) {
            if (sp.country !== config.game.country) { continue; }
            // Trim the name because if it's not a URL it starts with a \n and has white spaces around.
            if (sp.name.startsWith("\n")) { sp.name = sp.name.substr(2).trim(); }
            // Save the person.
            const person: PersonModel = new PersonModel();
            person.name = sp.name;
            await repo.addPerson(person);
        }
        // Return the list of persons.
        const persons: PersonEntity[] = await repo.getPersons(true);
        res.status(200).json(persons.map((p) => p._transform()));
    } catch (e) {
        res.status(500).json({ error: "SERVER_ERRO" });
        console.log(e);
    }
});

/**
 * Download the HTML page containing the competitors list.
 *
 * @param id The WCA competition ID
 */
async function getWCACompetitors(id: string) {
    return request({
        method: "GET",
        uri: `https://www.worldcubeassociation.org/competitions/${id}/registrations`,
        json: false,
    });
}

//
router.get("/import/prices", isOrganizer, async (req, res) => {
    try {
        const eventRepo: CategoryRepository = getCustomRepository(CategoryRepository);
        const events: CategoryEntity[] = await eventRepo.getCategories();
        const repo: ResultsRepository = getCustomRepository(ResultsRepository);
        // Do this for each category
        for (const c of events) {
            // If the price was already computed, continue to the next event.
            if (c.priceComputed) { continue; }
            // Get the psych sheet
            const page: string = await getWCACompetitorsForEvent(config.wca.competition_id, c.id);
            let p: Array<{ name: string, country: string, rank: number }> = [];
            // Extract all the people names.
            cheerio("tbody tr td.name", page).map(async (i, e) => p.push({ name: e.firstChild.data, country: null, rank: 0 })).get();
            // Extract all the people countries.
            cheerio("tbody tr td.country", page).map(async (i, e) => p[i].country = e.firstChild.data).get();
            if (c.sortByAverage) {
                // Extract all the people average ranks.
                cheerio("tbody tr td.world-rank-average:not(:empty)", page).map(async (i, e) => p[i].rank = parseInt(e.firstChild.data)).get();
            } else {
                // Extract all the people single ranks.
                cheerio("tbody tr td.world-rank-single:not(:empty)", page).map(async (i, e) => p[i].rank = parseInt(e.firstChild.data)).get();
            }
            // For each person, if their country is not "Italy", discard them. Otherwise add them to the database.

            // Remove foreign competitors.
            p = p.filter((pers) => pers.country === config.game.country);
            let prevRank: number = 0;
            let prevPos: number = 0;
            // We consider only people who get points.
            for (let i = 0; i < Math.min(config.game.at_points, p.length); i++) {
                if (!p[i].rank) { break; }
                const result: ResultsModel = new ResultsModel();
                result.person = p[i].name;
                // If the ranks is the same of the previous person, assign same points and position.
                if (prevRank === p[i].rank) {
                    result.position = prevPos;
                    result.points = config.game.points[prevPos] * c.multiplicator;
                    // Otherwise assign position= i+1 and compute points.
                } else {
                    result.position = i + 1;
                    result.points = config.game.points[(i + 1)] * c.multiplicator;
                }
                // Save rank and position.
                prevRank = p[i].rank;
                prevPos = result.position;
                // Save the person.
                await repo.insertResult(result, c);
            }

            await eventRepo.setPriceComputed(c.id);
        }
        // Update prices.
        await getCustomRepository(PersonRepository).computePersonPrice();
        const result: PersonEntity[] = await getCustomRepository(PersonRepository).getPersons(true);
        // Delete temporary results from the table.
        await repo.deleteResults();
        // Return the persons list.
        res.status(200).json(result.map((r) => r._transform()));
    } catch (e) {
        res.status(500).json({ error: "SERVER_ERROR" });
        console.log(e);
    }
});

/**
 * Downloads the psych sheet of an event.
 *
 * @param id The WCA competition ID.
 * @param event The category ID.
 */
async function getWCACompetitorsForEvent(id: string, event: string) {
    return request({
        method: "GET",
        uri: `https://www.worldcubeassociation.org/competitions/${id}/registrations/psych-sheet/${event}`,
        json: false,
    });
}

router.get("/team", isLoggedIn, async (req, res) => {
    try {
        const team: TeamEntity = await getCustomRepository(TeamRepository).getUserTeam(req.user.id);
        res.status(200).json(team._transform());
    } catch (e) {
        res.status(200).json({});
    }

});

export { router };
