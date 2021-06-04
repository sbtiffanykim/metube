import express from "express";
import {
  callbackGithubLogin,
  callbackKakaoLogin,
  callbackNaverLogin,
  getEdit,
  logout,
  postEdit,
  see,
  startGithubLogin,
  startKakaoLogin,
  startNaverLogin,
} from "../controllers/userControllers";
import { protectorMiddleware, publicOnlyMiddleware } from "../middlewares";

const userRouter = express.Router();

userRouter.get("/logout", protectorMiddleware, logout);
userRouter.route("/edit").all(protectorMiddleware).get(getEdit).post(postEdit);
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/callback", callbackGithubLogin);
userRouter.get("/kakao/start", publicOnlyMiddleware, startKakaoLogin);
userRouter.get("/kakao/callback", callbackKakaoLogin);
userRouter.get("/naver/start", publicOnlyMiddleware, startNaverLogin);
userRouter.get("/naver/callback", callbackNaverLogin);
userRouter.get("/:id", see);

export default userRouter;
