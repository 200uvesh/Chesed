import mongoose from "mongoose";

const Create_Schema = mongoose.Schema(
  {
    Category_Name: {
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
    },
    Fare_Type: {
      type: String,
      enum: ["Free ride", "Share expense"],
    },

    Fare_Amount: {
      type: Number,
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
    Transport_To: {
      type: String,
    },
    Num_of_Items: {
      type: Number,
    },
    Total_Weight: {
      type: Number,
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

    Num_Of_Male: {
      type: Number,
    },
    Num_Of_Female: {
      type: Number,
    },
    Num_Of_Available_Seats: {
      type: Number,
    },
    Location: {
      type: String,
    },
    Help_Reason: {
      type: String,
    },
    Type_Of_Help: {
      type: String,
    },
    Gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    Age: {
      type: Number,
    },
    upload_image: {
      type: String,
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
    Duration: {
      type: Date,
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
      default: 0, // 0 for Pending  , 1 for Accepted  , 2 for In Progress , 3 for complete , 4 for cancel
    },
    Requested_User: [
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

const CreateRequest = mongoose.model("Create_Schema", Create_Schema);
export { CreateRequest };
