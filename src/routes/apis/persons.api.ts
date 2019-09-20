import { Router } from "express"
import request from "request-promise";
import { PersonRepository } from "../../database/repos/person.repository";
import { config } from "../../secrets/config";
import { getCustomRepository } from "typeorm";
import { PersonEntity } from "../../database/entities/person.entity";
import cheerio from "cheerio";
import { isOrganizer, isLoggedIn } from "../middlewares/auth.middleware";
import { PersonModel } from "../../model/person";
import { CategoryRepository } from "../../database/repos/category.repository";
import { CategoryEntity } from "../../database/entities/category.entity";
import { ResultsRepository } from "../../database/repos/results.repository";
import { ResultsModel } from "../../model/results";

const router: Router = Router();

router.get("/", async (req, res) => {
    let persons: PersonEntity[] = await getCustomRepository(PersonRepository).getPersons(true);
    res.status(200).json(persons.map((p) => p._transform()));
});


router.get("/import", isOrganizer, async (req, res) => {
    try {
        // Download the competitors page from the WCA website.
        let page: string = await getWCACompetitors(config.wca.competition_id);
        // Array of objects containing the list of registered people and their country.
        let p: { name: string, country: string }[] = [];
        // Extract all the people names.
        cheerio("tbody tr td.name:not(:has(a)), tbody tr td.name a", page).map(async (i, e) => p.push({ name: e.firstChild.data, country: null })).get();
        // Extract all the people countries.
        cheerio("tbody tr td.country:not(:has(a)), tbody tr td.country a", page).map(async (i, e) => p[i].country = e.firstChild.data).get();
        let repo: PersonRepository = getCustomRepository(PersonRepository);
        // For each person, if their country is not "Italy", discard them. Otherwise add them to the database.
        for (let sp of p) {
            if (sp.country !== config.game.country) continue;
            // Trim the name because if it's not a URL it starts with a \n and has white spaces around.
            if (sp.name.startsWith("\n")) sp.name = sp.name.substr(2).trim();
            // Save the person.
            let person: PersonModel = new PersonModel();
            person.name = sp.name;
            await repo.addPerson(person);
        }
        // Return the list of persons. 
        let persons: PersonEntity[] = await repo.getPersons(true);
        res.status(200).json(persons.map((p) => p._transform()));
    } catch (e) {
        res.status(500).json({ "error": "SERVER_ERRO" });
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
        let eventRepo: CategoryRepository = getCustomRepository(CategoryRepository);
        let events: CategoryEntity[] = await eventRepo.getCategories();
        let repo: ResultsRepository = getCustomRepository(ResultsRepository);
        // Do this for each category
        for (let c of events) {
            // If the price was already computed, continue to the next event.
            if (c.priceComputed) continue;
            // Get the psych sheet
            let page: string = await getWCACompetitorsForEvent(config.wca.competition_id, c.id);
            let p: { name: string, country: string, rank: number }[] = [];
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
                if (!p[i].rank) break;
                let result: ResultsModel = new ResultsModel();
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
        let result: PersonEntity[] = await getCustomRepository(PersonRepository).getPersons(true);
        // Delete temporary results from the table.
        await repo.deleteResults();
        // Return the persons list.
        res.status(200).json(result.map(r => r._transform()));
    } catch (e) {
        res.status(500).json({ "error": "SERVER_ERROR" });
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

export { router }

