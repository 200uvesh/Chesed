import mongoose from "mongoose";

const PrivacyPolicy_Schema = mongoose.Schema(
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

const PrivacyPolicy = mongoose.model("PrivacyPolicy_Schema", PrivacyPolicy_Schema);
export { PrivacyPolicy };
