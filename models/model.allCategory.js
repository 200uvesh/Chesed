import mongoose from "mongoose";

const AllCategory_Schema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User_Model",
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    category_number: {
      type: Number,
    },

    category_name: {
      type: String,
    },
    requestedUser: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User_Model",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const AllCategory = mongoose.model("AllCategory_Schema", AllCategory_Schema);
export { AllCategory };
