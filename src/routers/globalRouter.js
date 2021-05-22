import express from "express";
import { join, login } from "../controllers/userControllers";
import { search, trending } from "../controllers/videoControllers";

const globalRouter = express.Router();

globalRouter.get("/", trending);
globalRouter.get("/join", join);
globalRouter.get("/login", login);
globalRouter.get("/serach", search);

export default globalRouter;
