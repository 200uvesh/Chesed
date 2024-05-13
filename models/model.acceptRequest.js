import mongoose from "mongoose";

const AcceptRequest_Schema = mongoose.Schema(
  {
    userId_creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User_Model",
    },
    userId_acceptor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User_Model",
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    category_Id: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const AcceptRequest = mongoose.model(
  "AcceptRequest_Schema",
  AcceptRequest_Schema
);
export { AcceptRequest };
