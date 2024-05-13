import mongoose from "mongoose";

const WeddingAttedees_Schema = mongoose.Schema(
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

    Total_Females: {
      type: Number,
    },
    Total_Males: {
      type: Number,
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
      default: 0, // 0 for Pending  , 1 for Accepted  , 2 for In Progress , 3 for complete , 4 cancel
    },
  },
  {
    timestamps: true,
  }
);

WeddingAttedees_Schema.pre("save", async function (next) {
  this.category_Id = 8;
  next();
});

const WeddingAttendees = mongoose.model(
  "WeddingAttedees_Schema",
  WeddingAttedees_Schema
);
export { WeddingAttendees };
