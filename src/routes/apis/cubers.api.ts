import { Router } from "express";
import { getCubers, getTeam, importCubers, importPrices } from "../controllers/person.api.controller";
import { isOrganizer } from "../middlewares/auth.middleware";

const router: Router = Router();

router.get("/", getCubers);

router.get("/import", /*isOrganizer,*/ importCubers);

router.get("/import/prices", /*isOrganizer, */importPrices);

router.get("/team", getTeam);
export { router };
