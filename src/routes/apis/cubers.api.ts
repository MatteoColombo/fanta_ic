import { Router } from "express";
import { isOrganizer } from "../middlewares/auth.middleware";
import { getCubers, importCubers, importPrices, getTeam } from "../controllers/person.api.controller";

const router: Router = Router();

router.get("/", getCubers);

router.get("/import", /*isOrganizer,*/ importCubers);

router.get("/import/prices", /*isOrganizer, */importPrices);

router.get("/team", getTeam);
export { router };
