import mongoose from "mongoose";

const MealTrain_Schema = mongoose.Schema(
  {
    category_Id: {
      type: Number,
    },

    Service_Name: {
      type: String,
      required: true,
    },
    Help_type: {
      type: String,
      enum: ["Instant Help", "Schedule"],
      default: "Instant Help",
    },

    Title: {
      type: String,
    },
    Description: {
      type: String,
    },
    Location: {
      type: String,
    },

    Breakfast: {
      type: Number,
    },

    Lunch: {
      type: Number,
    },
    Dinner: {
      type: Number,
    },

    Select_Dates: {
      type: [Date],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User_Model",
    },
    status: {
      type: Number,
      default: 0, // 0 for Pending  , 1 for Accepted  , 2 for In Progress , 3 for complete , 4 cancel
    },
  },
  {
    timestamps: true,
  }
);

MealTrain_Schema.pre("save", async function (next) {
  this.category_Id = 3;
  next();
});

const MealTrain = mongoose.model("MealTrain_Schema", MealTrain_Schema);
export { MealTrain };
