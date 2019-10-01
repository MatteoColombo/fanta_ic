import { Router } from "express";
import { isOrganizer, isLoggedInWR, isGuest } from "./middlewares/auth.middleware";
import { renderHome, renderLogin, renderRules, renderLeaderboard, renderTeamPage, renderMyTeamPage, renderAdminPage } from "./controllers/pages.routes.controller";

const router: Router = Router();

router.get("/", renderHome);

router.get("/login", isGuest, renderLogin);

router.get("/regolamento", renderRules);

router.get("/classifica", renderLeaderboard);

router.get("/team", isLoggedInWR)

router.get("/team", isLoggedInWR, renderMyTeamPage);

router.get("/team/:id", renderTeamPage);


router.get("/admin", isLoggedInWR, isOrganizer, renderAdminPage);

export { router }
