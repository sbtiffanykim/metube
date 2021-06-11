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
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
});

userSchema.pre("save", async function () {
  // hash the password only if a user's password is modified
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 7);
  }
});

const User = mongoose.model("User", userSchema);
export default User;
