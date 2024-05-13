import mongoose from "mongoose";

const RideShare_Schema = mongoose.Schema(
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

    Service_Identity: {
      type: String,
      enum: ["Passenger", "Driver"],
      default: "Passenger",
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

    Where_To: {
      type: String,
    },

    Num_Of_Male: {
      type: Number,
    },
    Num_Of_Female: {
      type: Number,
    },

    Duration: {
      type: Date,
    },

    Schedule: {
      type: Date,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User_Model",
    },
    status: {
      type: Number,
      default: 0, // 0 for Pending  , 1 for Accepted  , 2 for In Progress , 3 for complete , 4 cancel
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

RideShare_Schema.pre("save", async function (next) {
  this.category_Id = 1;
  next();
});

const RideShare = mongoose.model(
  "RideShare_Passenger_Schema",
  RideShare_Schema
);
export { RideShare };
