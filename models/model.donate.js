import mongoose from "mongoose";

const Donate_Schema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User_Model",
    },
    
    Enter_Amount:{
        type : Number,

    }
    
  },
  {
    timestamps: true,
  }
);

const Donate = mongoose.model("Donate_Schema", Donate_Schema);
export { Donate };
