import express from "express";
import {
  callbackGithubLogin,
  callbackKakaoLogin,
  callbackNaverLogin,
  edit,
  logout,
  see,
  startGithubLogin,
  startKakaoLogin,
  startNaverLogin,
} from "../controllers/userControllers";

const userRouter = express.Router();

userRouter.get("/logout", logout);
userRouter.get("/edit", edit);
userRouter.get("/github/start", startGithubLogin);
userRouter.get("/github/callback", callbackGithubLogin);
userRouter.get("/kakao/start", startKakaoLogin);
userRouter.get("/kakao/callback", callbackKakaoLogin);
userRouter.get("/naver/start", startNaverLogin);
userRouter.get("/naver/callback", callbackNaverLogin);
userRouter.get("/:id", see);

export default userRouter;
