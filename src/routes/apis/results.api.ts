import { Router } from "express";
import { getImportableEvents, importRound } from "../controllers/result.api.controller";
import { isOrganizer } from "../middlewares/auth.middleware";
import { checkInputRequest } from "../middlewares/results.middleware";

const router: Router = Router();

router.get("/categories/importable", isOrganizer, getImportableEvents);
router.get("/import/events/:event/rounds/:round", isOrganizer, checkInputRequest, importRound);

export { router };
