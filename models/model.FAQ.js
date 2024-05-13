import mongoose from "mongoose";

const FAQ_Schema = mongoose.Schema(
  [{
    Question:{
        type : String,
    }
    ,
    Answer:{
      type : String
    }
    
  }],
  {
    timestamps: true,
  }
);

const FAQ = mongoose.model("FAQ_Schema", FAQ_Schema);
export { FAQ };
