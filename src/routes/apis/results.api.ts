import { Router } from "express";
import { isOrganizer } from "../middlewares/auth.middleware";
import { checkInputRequest } from "../middlewares/results.middleware";
import { getImportableEvents, importRound } from "../controllers/result.api.controller";

const router: Router = Router();

router.get("/categories/importable", /*isOrganizer,*/ getImportableEvents);
router.get("/import/events/:event/rounds/:round",/* isOrganizer,*/ checkInputRequest, importRound);

export { router };
