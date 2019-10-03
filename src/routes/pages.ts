import { Router } from "express";
import { renderAdminPage, renderHome, renderLeaderboard, renderLogin, renderMyTeamPage, renderRules, renderTeamPage } from "./controllers/pages.routes.controller";
import { isGuest, isLoggedInWR, isOrganizer } from "./middlewares/auth.middleware";

const router: Router = Router();

router.get("/", renderHome);

router.get("/login", isGuest, renderLogin);

router.get("/regolamento", renderRules);

router.get("/classifica", renderLeaderboard);

router.get("/team", isLoggedInWR);

router.get("/team", isLoggedInWR, renderMyTeamPage);

router.get("/team/:id", renderTeamPage);

router.get("/admin", isLoggedInWR, isOrganizer, renderAdminPage);

export { router };
