import { Router } from "express";
import { router as auth } from "./apis/auth.api";

const router: Router = Router();

router.use("/auth", auth);

export { router }
