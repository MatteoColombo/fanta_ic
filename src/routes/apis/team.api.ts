import { Router } from "express";
import { isLoggedIn } from "../middlewares/auth.middleware";
import { checkNewTeam, checkUpdateTeam, } from "../middlewares/team.middlewares";
import { newTeam, updateTeam, teamExists } from "../controllers/team.api.controller";

const router: Router = Router();

router.post("/", isLoggedIn, checkNewTeam, newTeam);

router.put("/", isLoggedIn, checkUpdateTeam, updateTeam);

router.get("/exists", isLoggedIn, teamExists);

export { router };
