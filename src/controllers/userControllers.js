import User from "../models/User";
import Video from "../models/Video";
import fetch from "node-fetch";
import bcrypt from "bcrypt";

export const getJoin = (req, res) =>
  res.render("join", { pageTitle: "Create Account" });

export const postJoin = async (req, res) => {
  const { name, username, email, password, password2, location } = req.body;
  const pageTitle = "Join";

  // check if the password cofirmation matches to the password
  if (password !== password2) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "Password confirmation does not match",
    });
  }

  // check if the username / email already exists
  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (exists) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "This username/email is already exists",
    });
  }
  try {
    // create a user
    await User.create({
      name,
      username,
      email,
      password,
      location,
    });
    res.redirect("/login");
  } catch (error) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: error._message,
    });
  }
};

export const getLogin = (req, res) =>
  res.render("login", { pageTitle: "Login" });

export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const pageTitle = "Login";
  const user = await User.findOne({ username, socialLogin: false });
  // check if the user is exists
  if (!user) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "Username does not exists",
    });
  }
  // check if the password matches to the account
  const check = await bcrypt.compare(password, user.password);
  if (!check) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "Wrong password!",
    });
  }
  // log the user in
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const callbackGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      return res.redirect("/login");
    }
    // to check if there is a user with the email provided by github
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      // create an account
      user = await User.create({
        avatarUrl: userData.avatar_url,
        name: userData.name ? userData.name : userData.login,
        username: userData.login,
        email: emailObj.email,
        password: "",
        socialLogin: true,
        location: userData.location ? userData.location : "Unknown",
      });
    }
    // log the created user
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

export const startKakaoLogin = (req, res) => {
  const baseUrl = "https://kauth.kakao.com/oauth/authorize";
  const config = {
    client_id: process.env.KAKAO_CLIENT,
    redirect_uri: "http://localhost:4000/users/kakao/callback",
    response_type: "code",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const callbackKakaoLogin = async (req, res) => {
  const baseUrl = "https://kauth.kakao.com/oauth/token";
  const config = {
    grant_type: "authorization_code",
    client_id: process.env.KAKAO_CLIENT,
    redirect_uri: "http://localhost:4000/users/kakao/callback",
    code: req.query.code,
    client_secret: process.env.KAKAO_SECRET,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    })
  ).json();

  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://kapi.kakao.com";
    const userData = await (
      await fetch(`${apiUrl}/v2/user/me`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
    ).json();

    let user = await User.findOne({ email: userData.kakao_account.email });
    if (!user) {
      // create an account
      user = await User.create({
        avatarUrl: userData.kakao_account.profile.profile_image_url,
        name: userData.kakao_account.profile.nickname
          ? userData.kakao_account.profile.nickname
          : "Unknown",
        username: userData.kakao_account.profile.nickname
          ? userData.kakao_account.profile.nickname
          : "Unknown",
        email: userData.kakao_account.email,
        password: "",
        socialLogin: true,
        location: "Unknown",
      });
    }
    // log the user in
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    res.redirect("/login");
  }
};

export const startNaverLogin = (req, res) => {
  const state =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  const baseUrl = "https://nid.naver.com/oauth2.0/authorize";
  const config = {
    response_type: "code",
    client_id: process.env.NAVER_CLIENT,
    redirect_uri: "http://localhost:4000/users/naver/callback",
    state: state,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const callbackNaverLogin = async (req, res) => {
  const baseUrl = "https://nid.naver.com/oauth2.0/token";
  const config = {
    grant_type: "authorization_code",
    client_id: process.env.NAVER_CLIENT,
    client_secret: process.env.NAVER_SECRET,
    code: req.query.code,
    state: req.query.state,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        "X-Naver-Client-Id": process.env.NAVER_CLIENT,
        "X-Naver-Client-Secret": process.env.NAVER_SECRET,
      },
    })
  ).json();

  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://openapi.naver.com";
    const userData = await (
      await fetch(`${apiUrl}/v1/nid/me`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "text/json;charset=utf-8",
        },
      })
    ).json();

    let user = await User.findOne({ email: userData.response.email });
    if (!user) {
      // create an account
      user = await User.create({
        avatarUrl: userData.response.profile_image,
        name: userData.response.name ? userData.response.name : "Unknown",
        username: userData.response.nickname
          ? userData.response.nickname
          : "Unknown",
        email: userData.response.email,
        password: "",
        socialLogin: true,
        location: "Unknown",
      });
    }
    // log the user in
    req.session.loggedIn = true;
    req.session.user = user;
    res.redirect("/");
  } else {
    res.redirect("/login");
  }
};

export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};

export const getEdit = (req, res) => {
  return res.render("users/edit-profile", { pageTitle: "Edit Profile" });
};

export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id, avatarUrl, email: sessionEmail, username: sessionUsername },
    },
    body: { name, email, username, location },
    file,
  } = req;
  // to check if the user wants to change his/her email / username
  let params = [];
  if (sessionEmail !== email) {
    params.push({ email });
  }
  if (sessionUsername !== username) {
    params.push({ username });
  }
  // if the user has something to change
  if (params.length > 0) {
    // find a user who already use the email/username is given above
    const foundUser = await User.findOne({ $or: params });
    if (foundUser && foundUser._id.toString() !== _id) {
      return res.status(400).render("users/edit-profile", {
        pageTitle: "Edit Profile",
        errorMessage: "This username/email is already taken",
      });
    }
  }
  // if there is no user, update the current user's info
  const updateUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? file.path : avatarUrl,
      name,
      email,
      username,
      location,
    },
    { new: true }
  );
  // update the user info in the session
  req.session.user = updateUser;
  return res.redirect("/users/edit");
};

export const getChangePassword = (req, res) => {
  return res.render("users/change-password", { pageTitle: "Change Password" });
};

export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { currentPassword, newPassword, newPasswordConfirmation },
  } = req;
  const user = await User.findById({ _id });
  const check = await bcrypt.compare(currentPassword, user.password);
  // if the current password does not match
  if (!check) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "Please check the current password",
    });
  }
  // if the confirmation password does not match to the newPassword
  if (newPassword !== newPasswordConfirmation) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The password does not match the confirmation",
    });
  }
  user.password = newPassword;
  await user.save();
  // send notification
  return res.redirect("/");
};

export const see = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate("videos");
  if (!user) {
    return res.status(404).render("404", { pageTitle: "User not Found" });
  }
  return res.render("users/profile", {
    pageTitle: `${user.name}'s Profile`,
    user,
  });
};
