import mongoose from "mongoose";

const HouseHold_Schema = mongoose.Schema(
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
      enum: [
        "House cleaning",
        "Home maintenance",
        "Cooking and meal services",
        "BabySitting",
        "Personal care services",
        "Laundary and ironing services",
        "Grocery shopping and delivery",
        "Home organization",
        "Pet setting",
        "Home security services",
        "Landscaping and gardening",
        "Finincial service",
        "Tutoring",
      ],
    },
    Description: {
      type: String,
    },
    Location: {
      type: String,
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

HouseHold_Schema.pre("save", async function (next) {
  this.category_Id = 12;
  next();
});

const HouseHold = mongoose.model("HouseHold_Schema", HouseHold_Schema);
export { HouseHold };
