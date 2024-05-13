import mongoose from "mongoose";

const Compliments_Schema = mongoose.Schema(
  {
     From_Compliment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User_Model",
    },
    To_Compliment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User_Model",
    },
    Compliment_text:{
        type : String
    },
    Thumbs_Up :{
        type : Boolean,
        default:false 
    }
  },
  {
    timestamps: true,
  }
);

const Compliment = mongoose.model("Compliments_Schema", Compliments_Schema);
export { Compliment };
