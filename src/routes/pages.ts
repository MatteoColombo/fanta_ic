import { Router } from "express";
import { isOrganizer, isLoggedIn } from "./middlewares/auth.middleware";
import { config } from "../secrets/config";
import { TeamEntity } from "../database/entities/team.entity";
import { getCustomRepository } from "typeorm";
import { TeamRepository } from "../database/repos/team.repository";
import { PersonEntity } from "../database/entities/person.entity";
import { PersonRepository } from "../database/repos/person.repository";
import { UserEntity } from "../database/entities/user.entity";

const router: Router = Router();
const fakeLeaderboard = [{ name: "Ciccio", points: 24, position: 1 }, { name: "Andrea", points: 17, position: 2 },
{ name: "Carlo", points: 5, position: 3 }, { name: "Piero", points: 4, position: 4 }];
const fakePersons = [{ name: "Ciccio", price: 24, id: 1 }, { name: "Andrea", price: 17, id: 2 },
{ name: "Carlo", price: 5, id: 3 }, { name: "Piero", price: 4, id: 4 }];
const fakeTeam = [{ name: "Ciccio", price: 24, id: 1 }];

router.get("/", (req, res) => res.render("home", { title: "FantaIC", user: req.user }));

router.get("/regolamento", (req, res) => res.render("regulation", { title: "Regolamento - FantaIC", user: req.user }));

router.get("/classifica", (req, res) => res.render("leaderboard", {
    title: "Classifica - FantaIC", user: req.user,
    teams: fakeLeaderboard
}));

router.get("/crea", async (req, res) => {
    //let cubers: PersonEntity[] = await getCustomRepository(PersonRepository).getPersons(true);
    //let team: TeamEntity = await getCustomRepository(TeamRepository).getUserTeam(req.user.id);
    res.render("createteam", { 
        title: "Crea squadra - FantaIC", 
        user: req.user,
        cubers: fakePersons, //cubers.map((c)=>c._transform()),
        team: fakeTeam //team.cubers.map((c)=>c._transform())

    })
});

router.get("/admin", isOrganizer, async (req, res) => {
    let today: Date = new Date();
    let creation_closes: Date = new Date(config.game.creation_closes.year, config.game.creation_closes.month, config.game.creation_closes.day, config.game.creation_closes.hour, config.game.creation_closes.minute);
    let creation_opens: Date = new Date(config.game.creation_opens.year, config.game.creation_opens.month, config.game.creation_opens.day, config.game.creation_opens.hour, config.game.creation_opens.minute);
    if (today > creation_closes) {
        res.render("adminpage", {
            title: "Admin - FantaIC",
            user: req.user,
            import_results: true,
            import_data: false
        });
    } else if (today < creation_opens) {
        res.render("adminpage", {
            title: "Admin - FantaIC",
            user: req.user,
            import_results: false,
            import_data: true
        });
    } else {
        let teams: TeamEntity[] = await getCustomRepository(TeamRepository).getTeams(false);
        res.render("adminpage", {
            title: "Admin - FantaIC",
            user: req.user,
            import_results: false,
            import_data: false,
            teams: teams.map((t)=>t._transform())
        });
    }
});

export { router }