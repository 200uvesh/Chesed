import mongoose from "mongoose";

const TermAndCondition_Schema = mongoose.Schema(
  {
    Title:{
      type : String,
  }
  ,
  Description:{
    type : String
  }
  },
  {
    timestamps: true,
  }
);

const TermAndCondition = mongoose.model("TermAndCondition_Schema", TermAndCondition_Schema);
export { TermAndCondition };
