import User from "../models/User";
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
        name: userData.name ? userData.name : "Unknown",
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

export const logout = (req, res) => res.send("Logout");

export const edit = (req, res) => res.send("Edit User");
export const remove = (req, res) => res.send("Remove User");
export const see = (req, res) => res.send("See User");
