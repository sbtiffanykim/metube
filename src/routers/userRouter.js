import express from "express";
import {
  callbackGithubLogin,
  callbackKakaoLogin,
  edit,
  logout,
  remove,
  see,
  startGithubLogin,
  startKakaoLogin,
} from "../controllers/userControllers";

const userRouter = express.Router();

userRouter.get("/logout", logout);
userRouter.get("/edit", edit);
userRouter.get("/github/start", startGithubLogin);
userRouter.get("/github/callback", callbackGithubLogin);
userRouter.get("/kakao/start", startKakaoLogin);
userRouter.get("/kakao/callback", callbackKakaoLogin);
userRouter.get("/:id", see);

export default userRouter;
