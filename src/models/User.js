import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  avatarUrl: String,
  socialLogin: { type: Boolean, default: false },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String },
  location: String,
});

userSchema.pre("save", async function () {
  console.log("users password: ", this.password);
  this.password = await bcrypt.hash(this.password, 7);
  console.log("hashed password: ", this.password);
});

const User = mongoose.model("User", userSchema);
export default User;
