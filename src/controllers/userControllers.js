import User from "../models/User";
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
  const user = await User.findOne({ username });
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
  // logged user in
  return res.redirect("/");
};

export const edit = (req, res) => res.send("Edit User");
export const remove = (req, res) => res.send("Remove User");
export const see = (req, res) => res.send("See User");
export const logout = (req, res) => res.send("Logout");
