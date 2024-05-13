import mongoose from "mongoose";

const ContactUs_Schema = mongoose.Schema(
  {
    Email:{
      type : String,
  }
  
    
  },
  {
    timestamps: true,
  }
);

const ContactUs = mongoose.model("ContactUs_Schema", ContactUs_Schema);
export { ContactUs };
