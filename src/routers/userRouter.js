import express from "express";
import {
  callbackGithubLogin,
  edit,
  logout,
  remove,
  see,
  startGithubLogin,
} from "../controllers/userControllers";

const userRouter = express.Router();

userRouter.get("/logout", logout);
userRouter.get("/edit", edit);
userRouter.get("/delete", remove);
userRouter.get("/github/start", startGithubLogin);
userRouter.get("/github/callback", callbackGithubLogin);
userRouter.get("/:id", see);

export default userRouter;
