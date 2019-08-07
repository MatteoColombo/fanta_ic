import { Router } from "express";
import { router as auth } from "./apis/auth.api";
import { router as team } from "./apis/team.api";

const router: Router = Router();

router.use("/auth", auth);
router.use("/team", team);

export { router }
