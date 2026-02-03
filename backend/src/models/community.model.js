import mongoose from "mongoose";

const communitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  minAge: { type: Number, required: true },
  maxAge: { type: Number, required: true },
  isElderly: { type: Boolean, default: false }, 
});

export default mongoose.model("Community", communitySchema);