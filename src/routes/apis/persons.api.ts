import { Router } from "express"
import request from "request-promise";
import { PersonModel } from "../../model/person";
import { PersonRepository } from "../../database/repos/person.repository";
import { config } from "../../secrets/config";
import { getCustomRepository } from "typeorm";
import { PersonEntity } from "../../database/entities/person.entity";

const router: Router = Router();

//THIS API IS JUST FOR TESTING PURPOSES. IT SHOULD IMPORT DATA FROM WCA WEBSITE.

router.get("/update", async (req, res) => {
    try {
        let repo: PersonRepository = getCustomRepository(PersonRepository);
        await repo.updateUserPoints();
        let person: PersonEntity[] = await repo.getPersons();
        person = person.sort((a, b) => b.points - a.points);
        let model: PersonModel[] = person.map((p) => p._transform());
        res.status(200).json(model);
    } catch (e) {
        console.log(e);
        res.status(500).json({ "error": "ERROR" });
    }


});

router.get("/import", async (req, res) => {
    try {
        const url = `https://m.cubecomps.com/api/v1/competitions/${config.cubecomps.competition_id}`;
        let json = await getCubecompsJSON(url);
        let repo: PersonRepository = getCustomRepository(PersonRepository);
        for (let c of json['competitors']) {
            let person: PersonModel = new PersonModel();
            person.name = c.name;
            person.points = 0;
            person.price = 10;
            await repo.addPerson(c);
        }
        res.json({ "ok": "OK" });

    } catch (e) {
        console.log(e);
        res.status(500).json({ "error": "ERROR" });
    }
});

async function getCubecompsJSON(url: string) {
    return request({
        method: "GET",
        uri: url,
        json: true,
    });
}

export { router }

