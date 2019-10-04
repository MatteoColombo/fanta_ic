import { Router } from "express";
import { newTeam, teamExists, updateTeam } from "../controllers/team.api.controller";
import { isLoggedIn } from "../middlewares/auth.middleware";
import { checkNewTeam, checkUpdateTeam, } from "../middlewares/team.middlewares";

const router: Router = Router();

router.post("/", isLoggedIn, checkNewTeam, newTeam);

router.put("/", isLoggedIn, checkUpdateTeam, updateTeam);

router.get("/exists", isLoggedIn, teamExists);

export { router };
