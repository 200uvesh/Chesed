import mongoose from "mongoose";

const Follow_Schema = mongoose.Schema(
  {
    user_who_following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User_Model",
    },
    user_whom_following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User_Model",
    },
  },
  {
    timestamps: true,
  }
);

const Follow = mongoose.model("Follow_Schema", Follow_Schema);
export { Follow };
