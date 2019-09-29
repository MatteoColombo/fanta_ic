import { Router } from "express";
import { router as auth } from "./apis/auth.api";
import { router as cubers } from "./apis/cubers.api";
import { router as cubecomps } from "./apis/results.api";
import { router as team } from "./apis/team.api";

const router: Router = Router();

router.use("/auth", auth);
router.use("/team", team);
router.use("/results", cubecomps);
router.use("/cubers", cubers);

export { router };
