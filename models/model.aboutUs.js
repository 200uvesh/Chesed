import mongoose from "mongoose";

const AboutUs_Schema = mongoose.Schema(
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

const About = mongoose.model("AboutUs_Schema", AboutUs_Schema);
export { About };
