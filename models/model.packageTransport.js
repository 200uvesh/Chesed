import mongoose from "mongoose";

const Package_Transport_Schema = mongoose.Schema(
  {
    category_Id: {
      type: Number,
    },

    Service_Name: {
      type: String,
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
    Pickup_Location: {
      type: String,
    },

    Transport_To: {
      type: String,
    },

    Num_Of_Items: {
      type: Number,
    },
    Total_Weight: {
      type: Number,
    },

    Duration: {
      type: Date,
    },

    Schedule: {
      type: Date,
    },

    Repetition: {
      type: String,
      enum: ["Do not repeat", "Recurrence"],
      default: "Do not repeat",
    },

    Repeat_every: {
      type: Number,
    },

    Set_Repeat: {
      type: String,
      enum: ["Daily", "Weekly", "Monthly"],
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

await Package_Transport_Schema.pre("save", async function (next) {
  this.category_Id = 2;
  next();
});

const PackageTransport = mongoose.model(
  "Package_Transport_Schema",
  Package_Transport_Schema
);
export { PackageTransport };
