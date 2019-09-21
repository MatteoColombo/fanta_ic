import { Router } from "express";
import { router as auth } from "./apis/auth.api";
import { router as persons } from "./apis/persons.api";
import { router as cubecomps } from "./apis/results.api";
import { router as team } from "./apis/team.api";

const router: Router = Router();

router.use("/auth", auth);
router.use("/team", team);
router.use("/results", cubecomps);
router.use("/persons", persons);

export { router };
