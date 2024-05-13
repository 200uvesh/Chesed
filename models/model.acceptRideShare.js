import mongoose from "mongoose";

const AcceptRideShare_Schema = mongoose.Schema(
  {
    userId_creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User_Model",
    },
    userId_acceptor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User_Model",
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref : "RideShare_Passenger_Schema"
    },

    no_female:{
        type : Number

    },
    no_males:{
        type : Number

    },
    type_of_service:{
        type : String,
        enum : ["Free ride" , "Share expense"],
        default : "Free ride"

    } , 
    Amount:{
        type : Number,

    } , 

    category_Id: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const AcceptRideShare = mongoose.model(
  "AcceptRideShare_Schema",
  AcceptRideShare_Schema
);
export { AcceptRideShare };
