import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    age: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: "Available",
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "system",
    },
    language: {
      type: String,
      enum: ["en", "si", "ta"],
      default: "en",
    },
    wallpaper: {
      type: String,
      default: "default",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
